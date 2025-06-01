"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Phone, Info, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  bookingId?: string;
  sender: {
    name: string;
  };
  receiver: {
    name: string;
  };
}

interface UserInfo {
  id: string;
  name: string;
}

interface BookingInfo {
  id: string;
  status: string;
  numSeats: number;
  ride: {
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    departureTime: string;
    price: number;
  };
}

function DriverConversationContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userId = params.userId as string;
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (status === "authenticated") {
      if (!session?.user) {
        router.push("/sign-in");
      } else {
        fetchMessages();
        fetchUserInfo();
        if (bookingId) {
          fetchBookingInfo();
        }
        setupPusher();
      }
    }

    return () => {
      if (session?.user) {
        pusherClient.unsubscribe(`user-${session.user.id}`);
      }
    };
  }, [status, session, router, userId, bookingId]);

  const setupPusher = () => {
    if (!session?.user) return;

    const channel = pusherClient.subscribe(`user-${session.user.id}`);

    channel.bind("new-message", (data: { message: Message }) => {
      console.log("Received new message via Pusher:", data);
      const message = data.message;
      // Add the new message if it's from the current conversation
      if (
        (message.senderId === userId &&
          message.receiverId === session!.user!.id) ||
        (message.senderId === session!.user!.id &&
          message.receiverId === userId)
      ) {
        setMessages((prev) => [...prev, message]);
        // Mark as read if it's from the other user
        if (message.senderId === userId) {
          markMessageAsRead(message.id);
        }
      }
    });

    channel.bind("pusher:subscription_succeeded", () => {
      console.log(
        `Successfully subscribed to user-${session!.user!.id} channel`
      );
    });
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/profile`);
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const fetchBookingInfo = async () => {
    if (!bookingId) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBookingInfo(data);
      }
    } catch (err) {
      console.error("Error fetching booking info:", err);
    }
  };

  const fetchMessages = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ userId });
      if (bookingId) {
        queryParams.append("bookingId", bookingId);
      }

      const response = await fetch(`/api/messages?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);

      // Mark unread messages as read
      const unreadMessages = data.filter(
        (msg: Message) => msg.senderId === userId
      );
      unreadMessages.forEach((msg: Message) => {
        markMessageAsRead(msg.id);
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: "PUT",
      });
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageText.trim(),
          receiverId: userId,
          bookingId: bookingId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </Button>

            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInfo?.name
                  ?.split(" ")
                  .map((n) => n.charAt(0))
                  .join("")
                  .slice(0, 2) || "P"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="font-semibold text-foreground">
                {userInfo?.name || "Passenger"}
              </h1>
              {bookingId && (
                <p className="text-xs text-muted-foreground">
                  Booking #{bookingId.slice(0, 8)}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone size={16} />
              </Button>
              <Button variant="outline" size="sm">
                <Info size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      {bookingInfo && (
        <div className="max-w-md mx-auto px-4 py-3">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">
                    Booking Details
                  </h3>
                  <Badge className={getStatusBadgeColor(bookingInfo.status)}>
                    {bookingInfo.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    {bookingInfo.ride.fromLocation} →{" "}
                    {bookingInfo.ride.toLocation}
                  </p>
                  <p>
                    {format(new Date(bookingInfo.ride.departureDate), "PPP")} at{" "}
                    {bookingInfo.ride.departureTime}
                  </p>
                  <p>
                    ₹{bookingInfo.ride.price} per seat • {bookingInfo.numSeats}{" "}
                    seat(s) booked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-md mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === session?.user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      isCurrentUser
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(new Date(message.createdAt), "HH:mm")}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-card">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={sending || !messageText.trim()}
              size="sm"
              className="px-4"
            >
              <Send size={16} className={sending ? "animate-pulse" : ""} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverConversationPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin" size={24} />}>
      <DriverConversationContent />
    </Suspense>
  );
}
