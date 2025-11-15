import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const auditLogs = await prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: {
        timestamp: "desc",
      },
    });

    const totalLogs = await prisma.auditLog.count();

    return NextResponse.json({
      auditLogs,
      totalPages: Math.ceil(totalLogs / limit),
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
