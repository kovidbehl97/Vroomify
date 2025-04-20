// /api/auth/[...nextAuth]/route.ts
import NextAuth, { AuthOptions, DefaultUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { Adapter } from 'next-auth/adapters';
import { getMongoClient } from '../../../_lib/mongodb'; // Import getMongoClient

// Extend the built-in User type if needed for role etc.
declare module 'next-auth' {
  interface User extends DefaultUser {
    role: string | undefined; // Ensure consistent modifiers
  }
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string; // Add id to session user
      role: string | undefined; // Ensure consistent modifiers
    };
  }
  interface JWT {
      id?: string;
      role: string | undefined; // Ensure consistent modifiers
  }
}


// Get the client promise from the shared management
const clientPromise: Promise<MongoClient> = getMongoClient(); // Use getMongoClient() here

// Explicitly type authOptions with AuthOptions
export const authOptions: AuthOptions = {
  // Provide the client promise to the adapter
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn('Authorize failed: Missing credentials');
          throw new Error('Missing credentials');
        }
        // Use the existing clientPromise handled by getMongoClient
        const client = await getMongoClient(); // Get the connected client
        const db = client.db('cars'); // Ensure your DB name for users is correct
        const user = await db.collection('users').findOne({ email: credentials.email });

        // Add check for user existence
        if (!user) {
            console.warn(`Authorize failed: No user found for email ${credentials.email}`);
            // Do not throw generic "Invalid credentials" immediately to prevent enumeration attacks
            // Instead, proceed to password check and return null there.
        }

        // If user is found AND has a password (manual registration/credentials)
        if (user && user.password) {
            const isMatch = await bcrypt.compare(credentials.password, user.password);
            if (isMatch) {
                 console.log(`Authorize successful for email ${credentials.email}`);
                // Return a plain object with necessary user properties
                return {
                    id: user._id.toString(), // MongoDB _id needs to be a string
                    email: user.email,
                    name: user.name, // Make sure 'name' exists on your user document
                    role: user.role || 'user' // Default role if missing
                };
            } else {
                 console.warn(`Authorize failed: Password mismatch for email ${credentials.email}`);
                 // Return null if password doesn't match
                 return null;
            }
        }

        // Return null if user not found or user has no password (e.g., trying credentials login on a social-only account)
        console.warn(`Authorize failed: User not found or has no password for email ${credentials.email}`);
        return null; // Important: Return null on failure

      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // User object is only available on the first sign in (when authorize returns a user)
      if (user) {
        token.id = user.id;
        // Ensure the role is added to the token
        token.role = (user as any).role; // Cast as any or ensure User type includes role
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure session.user exists and assign properties from the token
      if (session.user && token) {
         // Assign id and role from the token to the session user object
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Assign role from token
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt', // Use JWT session strategy
  },
  secret: process.env.NEXTAUTH_SECRET, // Use NEXTAUTH_SECRET for JWT secret
  // Optional: Add pages configuration if you have custom login pages
  // pages: {
  //   signIn: '/login', // Use your custom login page path
  //   // signOut: '/auth/signout',
  //   // error: '/auth/error', // Error code passed in query string as ?error=
  //   // verifyRequest: '/auth/verify-request', // (used for email/passwordless sign in)
  //   // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  // },
  // Optional: Add debug flag for development
   debug: process.env.NODE_ENV === 'development',
};

// Define handler using the typed options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };