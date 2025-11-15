import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET a single room type by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomType = await prisma.roomType.findUnique({
      where: { id: params.id },
    });
    if (!roomType) {
      return NextResponse.json(
        { message: "Room type not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(roomType);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PUT update a room type by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const updatedRoomType = await prisma.roomType.update({
      where: { id: params.id },
      data: {
        name,
        description,
        base_rate,
        max_occupancy,
        amenities: amenities || [],
      },
    });

    return NextResponse.json(updatedRoomType);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// DELETE a room type by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.roomType.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Room type deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
