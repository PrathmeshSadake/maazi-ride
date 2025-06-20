"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Search,
  User,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher";

interface Conversation {
  user: {
    id: string;
    name: string;
  };
  latestMessage: {
    id: string;
    content: string;
    createdAt: string;
    bookingId: string | null;
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
      if (!session) {
        router.push("/sign-in");
      } else {
        fetchConversations();
        setupPusher();
      }
    }

    return () => {
      if (session?.user) {
        pusherClient.unsubscribe(`user-${session.user.id}`);
      }
    };
  }, [status, session, router]);

  const setupPusher = () => {
    if (!session?.user) return;

    const channel = pusherClient.subscribe(`user-${session.user.id}`);

    channel.bind("new-message", (data: { message: any }) => {
      console.log("Received new message via Pusher:", data);
      // Refresh conversations when new message arrives
      fetchConversations();
    });

    channel.bind("pusher:subscription_succeeded", () => {
      console.log(
        `Successfully subscribed to user-${session!.user!.id} channel`
      );
    });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/messages");

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
    if (conversation.latestMessage.bookingId) {
      router.push(
        `/drivers/messages/${conversation.user.id}?bookingId=${conversation.latestMessage.bookingId}`
      );
    } else {
      router.push(`/drivers/messages/${conversation.user.id}`);
    }
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.user.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.rideDetails?.fromLocation
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.rideDetails?.toLocation
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
          <div className="flex items-center px-4 pt-8 pb-4">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-48 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 pt-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Messages from passengers will appear here when they contact you
            </p>
            <button
              onClick={() => router.push("/drivers")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
            >
              View Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.user.id}
                onClick={() => handleOpenConversation(conversation)}
                className="bg-white rounded-xl p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-white">
                      {conversation.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {conversation.user.name}
                      </h3>
                      <div className="flex items-center ml-2">
                        {conversation.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-bold text-white">
                              {conversation.unreadCount > 9
                                ? "9+"
                                : conversation.unreadCount}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(
                            new Date(conversation.latestMessage.createdAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 truncate mb-1">
                      {conversation.latestMessage.content}
                    </p>

                    {conversation.rideDetails && (
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="truncate">
                          {conversation.rideDetails.fromLocation.split(",")[0]}{" "}
                          → {conversation.rideDetails.toLocation.split(",")[0]}
                        </span>
                        <span className="mx-1">•</span>
                        <span>
                          {format(
                            new Date(conversation.rideDetails.departureDate),
                            "MMM d"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
