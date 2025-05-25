import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { value, description } = await request.json();
    const { id } = await params;


    if (!value) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 });
    }

    const setting = await prisma.setting.update({
      where: { id },
      data: {
        value,
        description,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Settings PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;


    await prisma.setting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
