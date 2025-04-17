// /api/auth/[...nextAuth]/route.ts
import NextAuth, { AuthOptions } from 'next-auth'; // Import AuthOptions
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { Adapter } from 'next-auth/adapters';

// Assuming getMongoClient is defined elsewhere and returns a connected client promise
// If not, use the original clientPromise logic
// import { getMongoClient } from '../../_lib/mongodb'; // Or wherever it is
const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect(); // Or use getMongoClient() if preferred

// Explicitly type authOptions with AuthOptions
export const authOptions: AuthOptions = {
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
          throw new Error('Missing credentials');
        }
        // Use the existing clientPromise here
        const client = await clientPromise;
        const db = client.db('vroomify'); // Ensure your DB name is correct
        const user = await db.collection('users').findOne({ email: credentials.email });

        // Add check for user existence before accessing user.password
        if (!user) {
            console.error(`Login attempt failed: No user found for email ${credentials.email}`);
            throw new Error('Invalid credentials');
        }
        // Add check if password exists on the user document (e.g., for Google sign-ins)
        if (!user.password) {
            console.error(`Login attempt failed: User ${credentials.email} has no password set (likely social login)`);
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
           console.error(`Login attempt failed: Password mismatch for email ${credentials.email}`);
           throw new Error('Invalid credentials');
        }

        // Ensure the returned object matches the expected shape for the session/token
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name, // Make sure 'name' exists on your user document
            role: user.role  // Make sure 'role' exists on your user document
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When using Credentials provider, the user object from authorize is passed on initial sign in
      if (user) {
        token.id = user.id;
        // Cast user.role carefully if it comes from the authorize function
        token.role = (user as any).role; // Or add 'role' to the user type if possible
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure session.user exists before assigning properties
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Assign role from token
      }
      return session;
    },
  },
  session: {
    // Now TypeScript knows 'strategy' must be 'jwt' or 'database'
    strategy: 'jwt',
  },
  secret: process.env.JWT_SECRET,
  // Optional: Add pages configuration if you have custom login pages
  // pages: {
  //   signIn: '/auth/signin',
  //   // signOut: '/auth/signout',
  //   // error: '/auth/error', // Error code passed in query string as ?error=
  //   // verifyRequest: '/auth/verify-request', // (used for email/passwordless sign in)
  //   // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  // },
  // Optional: Add debug flag for development
  // debug: process.env.NODE_ENV === 'development',
};

// Define handler using the typed options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };