"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Search, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <MessageSquare size={24} className="text-primary" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <MessageSquare size={24} className="text-primary" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No messages yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Messages from passengers will appear here when they contact you
            </p>
            <Button onClick={() => router.push("/drivers")}>
              View Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.user.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {conversation.user.name
                          ?.split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .slice(0, 2) || "P"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {conversation.user.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(conversation.latestMessage.createdAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                      {/* 
                      {conversation.rideDetails && (
                        <div className="text-xs text-muted-foreground mb-1">
                          {conversation.rideDetails.fromLocation} →{" "}
                          {conversation.rideDetails.toLocation}
                        </div>
                      )} */}

                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.latestMessage.content}
                      </p>
                    </div>

                    <ArrowRight size={16} className="text-muted-foreground" />
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
