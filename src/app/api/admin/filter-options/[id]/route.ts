import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.filterOptions.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Filter Options DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete filter option" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
