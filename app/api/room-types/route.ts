import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET all room types
export async function GET(req: Request) {
  try {
    const roomTypes = await prisma.roomType.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(roomTypes);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// POST create a new room type
export async function POST(req: Request) {
  try {
    const { name, description, base_rate, max_occupancy, amenities } =
      await req.json();

    // Basic validation
    if (!name || !base_rate || !max_occupancy) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const existingRoomType = await prisma.roomType.findUnique({
      where: { name },
    });

    if (existingRoomType) {
      return NextResponse.json(
        { message: "Room type with this name already exists." },
        { status: 409 }
      );
    }

    const newRoomType = await prisma.roomType.create({
      data: {
        name,
        description,
        base_rate,
        max_occupancy,
        amenities: amenities || [],
      },
    });

    return NextResponse.json(newRoomType, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
