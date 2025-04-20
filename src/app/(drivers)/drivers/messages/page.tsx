"use client";

import { useEffect, useState, useRef } from "react";
import { Search, ArrowRight, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";

interface Conversation {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  latestMessage: {
    id: string;
    content: string;
    createdAt: string;
    bookingId: string | null;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/sign-in");
      } else {
        fetchConversations();
        setupSSE();
      }
    }

    return () => {
      // Clean up SSE connection when component unmounts
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [isLoaded, user, router]);

  const setupSSE = () => {
    if (!user || sseRef.current) return;

    const eventSource = new EventSource("/api/messages/sse");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "newMessage") {
        // Update conversations list when a new message is received
        fetchConversations();
      }
    };

    eventSource.onerror = () => {
      // Close and retry connection after 5 seconds
      eventSource.close();
      sseRef.current = null;
      setTimeout(setupSSE, 5000);
    };

    sseRef.current = eventSource;
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
    router.push(
      `/drivers/messages/${conversation.user.id}?bookingId=${conversation.latestMessage.bookingId}`
    );
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // If the message is from today, show the time
    if (date.toDateString() === now.toDateString()) {
      return format(date, "HH:mm");
    }

    // If the message is from yesterday, show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // If the message is from this year, show the date
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, "MMM d");
    }

    // If the message is from a previous year, show the full date
    return format(date, "MMM d, yyyy");
  };

  // Filter conversations by search query
  const filteredConversations =
    searchQuery.trim() === ""
      ? conversations
      : conversations.filter((conversation) => {
          const fullName = `${conversation.user.firstName || ""} ${
            conversation.user.lastName || ""
          }`.toLowerCase();
          return fullName.includes(searchQuery.toLowerCase());
        });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search messages"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2 pl-10 pr-4 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-green-800 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-t-green-600 border-r-transparent border-b-green-600 border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.user.id}
              onClick={() => handleOpenConversation(conversation)}
              className={`flex items-center p-3 rounded-lg ${
                conversation.unreadCount > 0
                  ? "bg-green-50"
                  : "hover:bg-gray-50"
              } cursor-pointer`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <span className="font-bold">
                  {conversation.user.firstName?.charAt(0) || ""}
                  {conversation.user.lastName?.charAt(0) || ""}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate">
                    {conversation.user.firstName} {conversation.user.lastName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(conversation.latestMessage.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.latestMessage.content}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <div className="ml-2 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center w-5 h-5">
                  {conversation.unreadCount}
                </div>
              )}
              <ArrowRight size={16} className="text-gray-400 ml-2" />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredConversations.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
          <p className="text-gray-500 mt-1">
            Messages from passengers will appear here
          </p>
        </div>
      )}
    </div>
  );
}
