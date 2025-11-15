import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET a single room by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        roomType: true,
      },
    });
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }
    return NextResponse.json(room);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PUT update a room by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const updatedRoom = await prisma.room.update({
      where: { id: params.id },
      data: {
        room_number,
        typeId,
        floor,
        features: features || [],
        status,
        max_occupancy,
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// DELETE a room by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.room.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Room deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
