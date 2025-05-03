"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
  User,
  Calendar,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string;
  createdAt: string;
}

export default function RatingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState({
    total: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
  });

  // Fetch ratings data
  useEffect(() => {
    const fetchRatings = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch(`/api/drivers/${user.id}/reviews`);
        if (!response.ok)
          throw new Error("Failed to fetch ratings information");

        const data = await response.json();
        setRating(data.averageRating);
        setReviews(data.reviews);

        // Calculate rating statistics
        const stats = {
          total: data.reviews.length,
          fiveStar: data.reviews.filter((r: Review) => r.rating === 5).length,
          fourStar: data.reviews.filter((r: Review) => r.rating === 4).length,
          threeStar: data.reviews.filter((r: Review) => r.rating === 3).length,
          twoStar: data.reviews.filter((r: Review) => r.rating === 2).length,
          oneStar: data.reviews.filter((r: Review) => r.rating === 1).length,
        };
        setRatingStats(stats);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [isLoaded, user]);

  // Render star rating
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Render progress bar for star distribution
  const RatingBar = ({
    label,
    count,
    percentage,
  }: {
    label: string;
    count: number;
    percentage: number;
  }) => {
    return (
      <div className="flex items-center mb-1">
        <div className="w-12 text-sm">{label}</div>
        <div className="flex-1 mx-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        <div className="w-8 text-xs text-gray-500 text-right">{count}</div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Ratings & Reviews</h1>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Loading ratings information...</div>
      ) : (
        <>
          {/* Rating Overview */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <div className="text-5xl font-bold text-gray-800">
                  {rating ? rating.toFixed(1) : "—"}
                </div>
                <div className="flex justify-center md:justify-start mt-2">
                  {rating ? (
                    <StarRating rating={Math.round(rating)} />
                  ) : (
                    <p className="text-gray-500 text-sm">No ratings yet</p>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Based on {ratingStats.total} reviews
                </p>
              </div>

              <div className="w-full md:w-2/3">
                <RatingBar
                  label="5 stars"
                  count={ratingStats.fiveStar}
                  percentage={
                    ratingStats.total
                      ? (ratingStats.fiveStar / ratingStats.total) * 100
                      : 0
                  }
                />
                <RatingBar
                  label="4 stars"
                  count={ratingStats.fourStar}
                  percentage={
                    ratingStats.total
                      ? (ratingStats.fourStar / ratingStats.total) * 100
                      : 0
                  }
                />
                <RatingBar
                  label="3 stars"
                  count={ratingStats.threeStar}
                  percentage={
                    ratingStats.total
                      ? (ratingStats.threeStar / ratingStats.total) * 100
                      : 0
                  }
                />
                <RatingBar
                  label="2 stars"
                  count={ratingStats.twoStar}
                  percentage={
                    ratingStats.total
                      ? (ratingStats.twoStar / ratingStats.total) * 100
                      : 0
                  }
                />
                <RatingBar
                  label="1 star"
                  count={ratingStats.oneStar}
                  percentage={
                    ratingStats.total
                      ? (ratingStats.oneStar / ratingStats.total) * 100
                      : 0
                  }
                />
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Reviews</h2>
            </div>

            {reviews.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        <User size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{review.authorName}</div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <StarRating rating={review.rating} />
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <Star size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No reviews yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
