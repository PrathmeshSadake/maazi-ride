import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET handler - Fetch driver's reviews and ratings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    // Check if the user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's reviews
    const reviews = await prisma.review.findMany({
      where: { userId: params.id },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch the user's average rating
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { driverRating: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform the data into the expected format
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      authorName:
        review.author.firstName && review.author.lastName
          ? `${review.author.firstName} ${review.author.lastName}`
          : "Anonymous",
      createdAt: review.createdAt.toISOString(),
    }));

    return NextResponse.json({
      averageRating: user.driverRating || null,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Error fetching review information" },
      { status: 500 }
    );
  }
}
