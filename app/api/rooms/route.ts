import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET all rooms with pagination, search, and filter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || ""; // Filter by status
    const typeId = searchParams.get("typeId") || ""; // Filter by room type
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { room_number: { contains: search, mode: "insensitive" } },
        { roomType: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (typeId) {
      where.typeId = typeId;
    }

    const rooms = await prisma.room.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        room_number: "asc",
      },
      include: {
        roomType: true, // Include room type details
      },
    });

    const totalRooms = await prisma.room.count({ where });

    return NextResponse.json({
      rooms,
      totalPages: Math.ceil(totalRooms / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// POST create a new room
export async function POST(req: Request) {
  try {
    const { room_number, typeId, floor, features, status, max_occupancy } =
      await req.json();

    // Basic validation
    if (!room_number || !typeId || !floor || !max_occupancy) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const existingRoom = await prisma.room.findUnique({
      where: { room_number },
    });

    if (existingRoom) {
      return NextResponse.json(
        { message: "Room with this number already exists." },
        { status: 409 }
      );
    }

    const newRoom = await prisma.room.create({
      data: {
        room_number,
        typeId,
        floor,
        features: features || [],
        status,
        max_occupancy,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
