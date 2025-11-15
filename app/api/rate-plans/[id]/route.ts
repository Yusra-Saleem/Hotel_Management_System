import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET a single rate plan by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ratePlan = await prisma.ratePlan.findUnique({
      where: { id: params.id },
      include: {
        roomType: true,
      },
    });
    if (!ratePlan) {
      return NextResponse.json(
        { message: "Rate plan not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(ratePlan);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PUT update a rate plan by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const updatedRatePlan = await prisma.ratePlan.update({
      where: { id: params.id },
      data: {
        name,
        roomTypeId,
        refundable: refundable || false,
        seasonal_rate: seasonal_rate || [],
        extra_bed_policy: extra_bed_policy || {},
      },
    });

    return NextResponse.json(updatedRatePlan);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// DELETE a rate plan by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ratePlan.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Rate plan deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
