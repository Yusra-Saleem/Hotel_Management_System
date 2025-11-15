import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { HousekeepingStatus } from "@prisma/client";

const prisma = new PrismaClient();

// GET a single housekeeping task by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.housekeepingTask.findUnique({
      where: { id: params.id },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        assignedToStaff: true,
      },
    });
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PUT update a housekeeping task by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { roomId, assignedToStaffId, status, notes } = await req.json();

    const existingTask = await prisma.housekeepingTask.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Enforce status transitions
    const currentStatus = existingTask.status;
    let newStatus = status;

    if (newStatus && newStatus !== currentStatus) {
      switch (currentStatus) {
        case HousekeepingStatus.DIRTY:
          if (newStatus !== HousekeepingStatus.CLEANING) {
            return NextResponse.json(
              { message: "Invalid status transition from DIRTY." },
              { status: 400 }
            );
          }
          break;
        case HousekeepingStatus.CLEANING:
          if (newStatus !== HousekeepingStatus.INSPECTED) {
            return NextResponse.json(
              { message: "Invalid status transition from CLEANING." },
              { status: 400 }
            );
          }
          break;
        case HousekeepingStatus.INSPECTED:
          if (newStatus !== HousekeepingStatus.VACANT) {
            return NextResponse.json(
              { message: "Invalid status transition from INSPECTED." },
              { status: 400 }
            );
          }
          break;
        case HousekeepingStatus.VACANT:
          // Once vacant, it should typically only go back to DIRTY via a new task or specific event
          // For now, disallow direct transition from VACANT
          return NextResponse.json(
            { message: "Invalid status transition from VACANT." },
            { status: 400 }
          );
      }
    }

    const updatedTask = await prisma.housekeepingTask.update({
      where: { id: params.id },
      data: {
        roomId,
        assignedToStaffId,
        status: newStatus || currentStatus,
        notes,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// DELETE a housekeeping task by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.housekeepingTask.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Housekeeping task deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
