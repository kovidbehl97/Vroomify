import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getMongoClient } from "../../_lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    const client: MongoClient = await getMongoClient();
    const db = client.db("cars");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      role: "user",
      createdAt: new Date(),
    });
    return NextResponse.json(
      { _id: result.insertedId, email, name, role: "user" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration API Error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error", message: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
