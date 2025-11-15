import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { HousekeepingStatus } from "@prisma/client";

const prisma = new PrismaClient();

// GET all housekeeping tasks with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const assignedToStaffId = searchParams.get("assignedToStaffId");
    const status = searchParams.get("status");

    const where: any = {};
    if (roomId) {
      where.roomId = roomId;
    }
    if (assignedToStaffId) {
      where.assignedToStaffId = assignedToStaffId;
    }
    if (status) {
      where.status = status;
    }

    const tasks = await prisma.housekeepingTask.findMany({
      where,
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        assignedToStaff: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// POST create a new housekeeping task
export async function POST(req: Request) {
  try {
    const { roomId, assignedToStaffId, notes } = await req.json();

    // Basic validation
    if (!roomId) {
      return NextResponse.json(
        { message: "Room ID is required." },
        { status: 400 }
      );
    }

    const newTask = await prisma.housekeepingTask.create({
      data: {
        roomId,
        assignedToStaffId,
        notes,
        status: HousekeepingStatus.DIRTY, // Default status
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
