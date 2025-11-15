import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const roomTypeId = searchParams.get("roomTypeId");
    const ratePlanId = searchParams.get("ratePlanId");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { message: "startDate and endDate are required." },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    // This is a simplified availability check.
    // A real-world scenario would involve a more complex booking system
    // with actual reservations, and potentially a dedicated availability table.

    // For now, we'll just return all rooms that match the criteria.
    // Overbooking prevention and concurrency handling would be implemented
    // at the point of making a reservation, likely involving transactions
    // and locking mechanisms.

    const where: any = {
      status: "VACANT", // Only consider vacant rooms for initial availability
    };

    if (roomTypeId) {
      where.typeId = roomTypeId;
    }

    const availableRooms = await prisma.room.findMany({
      where,
      include: {
        roomType: true,
      },
    });

    // Further filtering by rate plan would depend on how rate plans
    // are linked to actual bookings and availability.
    // For this simplified example, we'll just return the available rooms.

    return NextResponse.json(availableRooms);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
