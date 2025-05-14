import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Create a new review
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { targetUserId, rating, comment } = body;

    // Validate the data
    if (!targetUserId) {
      return new NextResponse("Target user ID is required", { status: 400 });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return new NextResponse("Invalid rating value", { status: 400 });
    }

    // Check that the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return new NextResponse("Target user not found", { status: 404 });
    }

    // Prevent users from reviewing themselves
    if (targetUserId === userId) {
      return new NextResponse("You cannot review yourself", { status: 400 });
    }

    // Check if the user has already reviewed this target
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: userId,
        userId: targetUserId,
      },
    });

    if (existingReview) {
      return new NextResponse("You have already reviewed this user", {
        status: 400,
      });
    }

    // Create the review
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        authorId: userId,
        userId: targetUserId,
      },
    });

    // If this is a driver being reviewed, update their average rating
    if (targetUser.role === "driver") {
      const allReviews = await prisma.review.findMany({
        where: { userId: targetUserId },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const avgRating = totalRating / allReviews.length;

      await prisma.user.update({
        where: { id: targetUserId },
        data: { driverRating: avgRating },
      });
    }

    // Create a notification for the reviewed user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "review",
        title: "New Review",
        message: `${session.user.name} has left you a review`,
        relatedId: newReview.id,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
