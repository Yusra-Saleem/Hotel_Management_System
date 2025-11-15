import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET all rate plans
export async function GET(req: Request) {
  try {
    const ratePlans = await prisma.ratePlan.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        roomType: true, // Include room type details
      },
    });
    return NextResponse.json(ratePlans);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// POST create a new rate plan
export async function POST(req: Request) {
  try {
    const { name, roomTypeId, refundable, seasonal_rate, extra_bed_policy } =
      await req.json();

    // Basic validation
    if (!name || !roomTypeId) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const existingRatePlan = await prisma.ratePlan.findFirst({
      where: { name, roomTypeId },
    });

    if (existingRatePlan) {
      return NextResponse.json(
        { message: "Rate plan with this name and room type already exists." },
        { status: 409 }
      );
    }

    const newRatePlan = await prisma.ratePlan.create({
      data: {
        name,
        roomTypeId,
        refundable: refundable || false,
        seasonal_rate: seasonal_rate || [],
        extra_bed_policy: extra_bed_policy || {},
      },
    });

    return NextResponse.json(newRatePlan, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
