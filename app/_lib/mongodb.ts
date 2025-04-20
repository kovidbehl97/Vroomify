// _lib/mongodb.ts
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'cars'; // Assuming 'cars' is your DB name, adjust if needed

if (!MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Define a global variable to cache the client promise
// This is needed to reuse the connection across function invocations in a serverless environment
let cachedClientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  // Use a global object type extension for Next.js development environment hot-reloading
  // In production, this simply refers to the standard global object.
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  // Reuse the cached promise if it exists
  if (globalWithMongo._mongoClientPromise) {
    console.log('Using cached MongoDB client promise');
    return globalWithMongo._mongoClientPromise;
  }

  // If no cached promise, create a new client and connection promise
  console.log('Creating new MongoDB client connection promise');
  const client = new MongoClient(MONGODB_URI!, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Add connection options here if needed, e.g., connection pool size
    // poolSize: 10 // Example
  });

  // Store the promise in the global cache
  globalWithMongo._mongoClientPromise = client.connect();

  // Return the promise
  return globalWithMongo._mongoClientPromise;
}

// Optional: Function to get the database directly
// You could potentially use this in your API routes instead of client.db('cars')
export async function getMongoDb() {
    const client = await getMongoClient(); // Ensure the client is connected
    return client.db(dbName);
}

// Good practice to handle potential errors during initial connection
// Although getMongoClient handles await, sometimes useful for initial check
// getMongoClient().catch(console.error);