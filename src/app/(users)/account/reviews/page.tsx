"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ReviewsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");
  const [editingReview, setEditingReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchReviews();
    }
  }, [status, router]);

  const fetchReviews = async () => {
    try {
      const receivedResponse = await fetch("/api/reviews/received");
      const givenResponse = await fetch("/api/reviews/given");

      if (!receivedResponse.ok || !givenResponse.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const receivedData = await receivedResponse.json();
      const givenData = await givenResponse.json();

      setReceivedReviews(receivedData);
      setGivenReviews(givenData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewText(review.comment || "");
    setReviewRating(review.rating);
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;

    try {
      const response = await fetch(`/api/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewText,
        }),
      });

      if (!response.ok) throw new Error("Failed to update review");

      // Update the UI
      const updatedReview = {
        ...editingReview,
        rating: reviewRating,
        comment: reviewText,
      };

      setGivenReviews(
        givenReviews.map((r) => (r.id === editingReview.id ? updatedReview : r))
      );

      setEditingReview(null);
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete review");

      // Update the UI
      setGivenReviews(givenReviews.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${
            i < Math.floor(rating)
              ? "text-yellow-500 fill-yellow-500"
              : i < rating
              ? "text-yellow-500 fill-yellow-500 opacity-50"
              : "text-gray-300"
          }`}
        />
      ));
  };

  const renderRatingInput = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={24}
          className={`cursor-pointer ${
            i < reviewRating
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300"
          }`}
          onClick={() => setReviewRating(i + 1)}
        />
      ));
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Reviews</h1>
        </div>

        {[1, 2, 3].map((_, i) => (
          <div key={i} className="mb-4">
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Reviews</h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          className={`flex-1 py-2 rounded-md ${
            activeTab === "received" ? "bg-white shadow-sm" : ""
          }`}
          onClick={() => setActiveTab("received")}
        >
          Received
        </button>
        <button
          className={`flex-1 py-2 rounded-md ${
            activeTab === "given" ? "bg-white shadow-sm" : ""
          }`}
          onClick={() => setActiveTab("given")}
        >
          Given
        </button>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {activeTab === "received" ? (
          receivedReviews.length === 0 ? (
            <div className="p-6 text-center">
              <Star size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No reviews received yet</p>
            </div>
          ) : (
            receivedReviews.map((review) => (
              <div key={review.id} className="p-4 border-b border-gray-100">
                <div className="flex items-start">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback>
                      {review.author.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-2">
                        {review.author.name}
                      </span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )
        ) : givenReviews.length === 0 ? (
          <div className="p-6 text-center">
            <Star size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">You haven't given any reviews yet</p>
          </div>
        ) : (
          givenReviews.map((review) => (
            <div key={review.id} className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback>
                      {review.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-2">
                        {review.user.name}
                      </span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit size={16} className="text-blue-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Review</DialogTitle>
                        <DialogDescription>
                          Update your review for {review.user.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="flex items-center mb-4">
                          <span className="mr-2">Rating:</span>
                          <div className="flex">{renderRatingInput()}</div>
                        </div>
                        <Textarea
                          placeholder="Your review (optional)"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button onClick={handleSaveReview}>Save</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
