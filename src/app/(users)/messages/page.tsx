"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Conversation {
  id: string;
  driverId: string;
  driverName: string;
  rideId?: string;
  bookingId?: string;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  rideDetails?: {
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    status: string;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      if (!session?.user) {
        router.push("/sign-in");
      } else {
        fetchConversations();

        // Listen for new messages from the global notification listener
        const handleNewMessage = () => {
          console.log("Refreshing conversations due to new message");
          fetchConversations();
        };

        window.addEventListener("pusher-new-message", handleNewMessage);

        return () => {
          window.removeEventListener("pusher-new-message", handleNewMessage);
        };
      }
    }
  }, [status, session, router]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/messages/conversations");
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = (conversation: Conversation) => {
    if (conversation.bookingId) {
      router.push(
        `/messages/direct/${conversation.driverId}?bookingId=${conversation.bookingId}&rideId=${conversation.rideId}`
      );
    } else {
      router.push(
        `/messages/direct/${conversation.driverId}?rideId=${conversation.rideId}`
      );
    }
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.driverName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (conversation.rideDetails?.fromLocation || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (conversation.rideDetails?.toLocation || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <div className="max-w-md mx-auto px-4 py-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            Your conversations
          </h2>

          <div className="relative mb-6">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-md mx-auto px-4 py-6">
        <h2 className="text-xl font-medium text-gray-800 mb-4">
          Your conversations
        </h2>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-gray-200 rounded-full"
          />
        </div>

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-medium mb-1">No conversations yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Start a conversation by booking a ride or contacting a driver
            </p>
            <Button onClick={() => router.push("/")}>Find Rides</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="cursor-pointer hover:shadow-sm transition-all border border-gray-100"
                onClick={() => handleOpenConversation(conversation)}
              >
                <CardContent className="p-4 py-0">
                  <div className="flex items-start">
                    <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {conversation.driverName?.charAt(0).toUpperCase() ||
                          "D"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-base truncate text-gray-900">
                          {conversation.driverName}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessage.createdAt),
                            { addSuffix: false }
                          )}{" "}
                          ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.senderId === session?.user?.id
                          ? "You: "
                          : ""}
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.rideDetails && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                          {conversation.rideDetails.fromLocation} to{" "}
                          {conversation.rideDetails.toLocation}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
