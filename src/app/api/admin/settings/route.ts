import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { key, value, description } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    // Check if setting already exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    });

    if (existingSetting) {
      return NextResponse.json(
        { error: "Setting with this key already exists" },
        { status: 409 }
      );
    }

    const setting = await prisma.setting.create({
      data: {
        key,
        value,
        description,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Settings POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create setting" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
