import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const filterOptions = await prisma.filterOptions.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(filterOptions);
  } catch (error) {
    console.error("Filter Options GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { name, displayName, options } = await request.json();

    if (!name || !displayName || !options) {
      return NextResponse.json(
        { error: "Name, display name, and options are required" },
        { status: 400 }
      );
    }

    // Check if filter option already exists
    const existingFilter = await prisma.filterOptions.findUnique({
      where: { name },
    });

    if (existingFilter) {
      return NextResponse.json(
        { error: "Filter option with this name already exists" },
        { status: 409 }
      );
    }

    const filterOption = await prisma.filterOptions.create({
      data: {
        name,
        displayName,
        options,
      },
    });

    return NextResponse.json(filterOption);
  } catch (error) {
    console.error("Filter Options POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create filter option" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
