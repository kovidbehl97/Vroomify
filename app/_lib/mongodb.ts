import { MongoClient, ServerApiVersion } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "cars";

if (!MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

export async function getMongoClient(): Promise<MongoClient> {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (globalWithMongo._mongoClientPromise) {
    try {
      const client = await globalWithMongo._mongoClientPromise;
      return client;
    } catch (error) {
      throw error;
    }
  }

  const client = new MongoClient(MONGODB_URI!, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    globalWithMongo._mongoClientPromise = client.connect();
    const connectedClient = await globalWithMongo._mongoClientPromise;
    return connectedClient;
  } catch (error) {
    throw error;
  }
}

export async function getMongoDb() {
  try {
    const client = await getMongoClient();
    return client.db(dbName);
  } catch (error) {
    throw error;
  }
}
