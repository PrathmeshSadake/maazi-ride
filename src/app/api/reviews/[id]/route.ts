import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Update a review
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const reviewId = (await params).id;
    const body = await request.json();
    const { rating, comment } = body;

    // Validate the data
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return new NextResponse("Invalid rating value", { status: 400 });
    }

    // Check if the review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
        authorId: userId,
      },
    });

    if (!existingReview) {
      return new NextResponse("Review not found or you're not the author", {
        status: 404,
      });
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating,
        comment,
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Delete a review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const reviewId = (await params).id;

    // Check if the review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
        authorId: userId,
      },
    });

    if (!existingReview) {
      return new NextResponse("Review not found or you're not the author", {
        status: 404,
      });
    }

    // Delete the review
    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting review:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
