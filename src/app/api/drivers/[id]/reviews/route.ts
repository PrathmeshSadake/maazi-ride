import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET handler - Fetch driver's reviews and ratings
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const id = (await params).id;

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the authenticated user is requesting their own data
    if (session.user.id !== id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch reviews from database
    const reviews = await prisma.review.findMany({
      where: {
        userId: id,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : null;

    // Format reviews for response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      authorName: review.author.name || "Anonymous User",
      createdAt: review.createdAt.toISOString(),
    }));

    // Return the reviews data
    return NextResponse.json({
      averageRating,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("Error fetching driver reviews:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
