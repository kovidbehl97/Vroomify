// app/api/cars/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../_lib/auth";
import { getMongoClient } from "../../_lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const carType = searchParams.get("carType") || "";
    const transmission = searchParams.get("transmission") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const client = await getMongoClient();
    const db = client.db("cars");

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { make: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }
    if (carType) query.carType = carType;
    if (transmission) query.transmission = transmission;

    const totalCars = await db.collection("cars").countDocuments(query);

    const cars = await db
      .collection("cars")
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({ cars, total: totalCars });
  } catch (error: unknown) {
    console.error("GET /api/cars - Error:", error);
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const {
      make,
      model,
      year,
      price,
      mileage,
      carType,
      transmission,
      imageUrl,
    } = await request.json();
    if (
      !make ||
      !model ||
      !year ||
      !price ||
      !mileage ||
      !carType ||
      !transmission
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db("cars");

    const result = await db.collection("cars").insertOne({
      make,
      model,
      year,
      price,
      mileage,
      carType,
      transmission,
      imageUrl: imageUrl || null,
    });

    return NextResponse.json(
      {
        _id: result.insertedId,
        make,
        model,
        year,
        price,
        mileage,
        carType,
        transmission,
        imageUrl,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/cars - Error:", error);
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
