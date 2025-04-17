// app/_lib/dbConnect.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (!process.env.MONGO_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

async function connectToDatabase(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  client = new MongoClient(uri!, options); // Use the non-null assertion operator here
  clientPromise = client.connect();

  return clientPromise;
}

export default connectToDatabase;