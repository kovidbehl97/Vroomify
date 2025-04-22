// /api/auth/[...nextAuth]/route.ts
import NextAuth, { AuthOptions, DefaultUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient, ObjectId } from 'mongodb';
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
    async signIn({ user, account, profile, email, credentials }) {
      console.log('Sign-in attempt in callback:', { user, account, profile, email, credentials });

      // --- Logic to add default role and update DB for users missing it (especially OAUTH users) ---
      // This 'user' object here reflects the data from the database if using an adapter (for OAuth),
      // or the object returned by the authorize function (for Credentials).
      // We only need to update the database for users managed by the adapter (OAuth users).
      // Credentials users should ideally have the role set during your custom registration.
      if (user && account?.type === 'oauth' && typeof user.role === 'undefined') {
          console.log(`OAuth user ${user.email || user.id} signing in for the first time or missing role. Setting default role 'user'.`);
          // Add a default role to the user object *for this session's processing*
          (user as any).role = 'user'; // Setting it here makes it available to jwt/session callbacks immediately

          // --- IMPORTANT: Update the user document in the database ---
          // Since this is an OAuth user managed by the MongoDBAdapter, update their document in the adapter's collection.
          let client;
          try {
            client = await getMongoClient();
            const db = client.db(); // Get the database instance the adapter is using (default or configured)
            const usersCollection = db.collection('users'); // Access the adapter's users collection

            // Find the user document in the database using the user's email from the OAuth profile
            // This email should match the email in the adapter's users collection
            const mongoUser = await usersCollection.findOne({ email: user.email });

            // If the user document is found in the database
            if (mongoUser) {
                // Now use the _id from the found MongoDB user document (mongoUser._id) to update it
                 console.log('Found MongoDB user document by email:', mongoUser._id.toString());

                 await usersCollection.updateOne(
                     { _id: mongoUser._id }, // *** Use the actual ObjectId from the found document ***
                     { $set: { role: 'user' } } // Set the 'role' field in the database
                 );
                  console.log(`User document ${mongoUser._id.toString()} updated with default role 'user'.`);
             } else {
                 // This case is less expected if the adapter just created/found the user by email,
                 // but it's possible in some edge cases or timing issues.
                 console.warn("Could not find MongoDB user document by email in signIn callback to update role. Email:", user.email);
                 // You might choose to return false here if the update is critical,
                 // or allow sign-in but log the issue. Allowing for now:
             }

        } catch (error) {
            console.error("Error updating user document with default role in signIn callback:", error);
            // Decide how to handle this error: deny sign-in, log and continue, etc.
            // Returning false here would deny the sign-in if the DB update fails.
            return false;
        }
      }

      // --- Logic to deny Credentials login if linked OAuth account exists ---
      // This check should happen BEFORE allowing the Credentials sign-in.
      // We moved this logic into the signIn callback itself for the Credentials type.
       if (account?.type === 'credentials') {
          // Check if the credentials exist and if the user is found in the database
         if (credentials === undefined) {
             console.warn('Authorize failed: Missing credentials in signIn callback');    
             return false; // Deny sign-in if credentials are missing
             }
          
         let client;
         try {
           client = await getMongoClient();
           const db = client.db(); // Get the database instance the adapter is using
           // Find the user in the adapter's 'users' collection using the email from credentials
           const userInDb = await db.collection('users').findOne({ email: credentials.email });

           if (userInDb) {
              // Check if this user has any linked accounts in the adapter's 'accounts' collection
              const linkedAccount = await db.collection('accounts').findOne({ userId: userInDb._id });

              if (linkedAccount) {
                  console.warn(`Authorize failed (Credentials in signIn callback): Email ${credentials.email} is linked to an OAuth account.`);
                  return false; // Deny Credentials login if linked OAuth account exists
              }
               console.log(`Credentials login allowed for ${credentials.email}. No linked OAuth account found.`);
               return true; // Allow Credentials login if authorize succeeded and no linked account
           }
            console.warn(`Authorize failed (Credentials in signIn callback): User not found in adapter DB for email ${credentials.email}`);
            return false; // User not found
         } catch (error) {
             console.error("Error during signIn callback database check for Credentials:", error);
             return false; // Prevent sign-in on error
         }
      }


      // Default return for other providers (like OAuth that passed the initial checks)
      // If this is an OAuth sign-in and no existing user was found with a linked account,
      // the adapter will handle creating the new user and account.
      console.log(`Allowing sign-in for account type: ${account?.type}.`);
      return true; // Allow the sign-in to proceed for OAuth etc.

    },

    // Keep your existing jwt and session callbacks below this
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
  // ... rest of your authOptions (session, secret, adapter, pages, debug)
  // Make sure the rest of the file is the same as your working "old code"
  session: {
    strategy: 'jwt', // Use JWT session strategy
  },
  secret: process.env.NEXTAUTH_SECRET, // Use NEXTAUTH_SECRET for JWT secret
   debug: process.env.NODE_ENV === 'development', // Assuming debug is part of your working code
};

// Define handler using the typed options
const handler = NextAuth(authOptions);

// *** Keep the export syntax from your working "old code" ***
export { handler as GET, handler as POST };