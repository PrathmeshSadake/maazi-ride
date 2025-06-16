"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, User, Phone, Info, Loader2 } from "lucide-react";
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
  read: boolean;
}

interface DriverInfo {
  id: string;
  name: string;
  phone?: string;
  driverRating?: number;
  ridesCompleted: number;
}

interface RideInfo {
  id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  price: number;
  status: string;
}

interface BookingInfo {
  id: string;
  status: string;
  numSeats: number;
}

function DirectMessageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [rideInfo, setRideInfo] = useState<RideInfo | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const driverId = params.driverId as string;
  const bookingId = searchParams.get("bookingId");
  const rideId = searchParams.get("rideId");

  useEffect(() => {
    if (status === "authenticated") {
      if (!session?.user) {
        router.push("/sign-in");
      } else {
        fetchMessages();
        fetchDriverInfo();
        if (rideId) fetchRideInfo();
        if (bookingId) fetchBookingInfo();
        setupPusher();
      }
    }

    return () => {
      if (session?.user) {
        pusherClient.unsubscribe(`user-${session.user.id}`);
      }
    };
  }, [status, session, router, driverId, bookingId, rideId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupPusher = () => {
    if (!session?.user) return;

    const channel = pusherClient.subscribe(`user-${session.user.id}`);

    channel.bind("new-message", (data: { message: Message }) => {
      console.log("Received new message via Pusher:", data);
      const message = data.message;

      // Add the new message if it's from the current conversation
      if (
        (message.senderId === driverId &&
          message.receiverId === session!.user!.id) ||
        (message.senderId === session!.user!.id &&
          message.receiverId === driverId)
      ) {
        setMessages((prev) => [...prev, message]);

        // Mark message as read if it's from the driver
        if (message.senderId === driverId) {
          markMessageAsRead(message.id);
        }
      }
    });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let url = `/api/messages?driverId=${driverId}`;
      if (bookingId) {
        url += `&bookingId=${bookingId}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);

      // Mark all messages from driver as read
      const unreadMessages = data.filter(
        (msg: Message) => msg.senderId === driverId && !msg.read
      );

      for (const msg of unreadMessages) {
        markMessageAsRead(msg.id);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverInfo = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/profile`);
      if (response.ok) {
        const data = await response.json();
        setDriverInfo(data);
      }
    } catch (err) {
      console.error("Error fetching driver info:", err);
    }
  };

  const fetchRideInfo = async () => {
    if (!rideId) return;

    try {
      const response = await fetch(`/api/rides/${rideId}`);
      if (response.ok) {
        const data = await response.json();
        setRideInfo(data);
      }
    } catch (err) {
      console.error("Error fetching ride info:", err);
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
          receiverId: driverId,
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

  const makePhoneCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, "_self");
    }
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-60px)] bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </Button>

            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {driverInfo?.name
                  ?.split(" ")
                  .map((n) => n.charAt(0))
                  .join("")
                  .slice(0, 2) || "D"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="font-semibold text-foreground truncate max-w-[150px]">
                {driverInfo?.name || "Driver"}
              </h1>
              <div className="space-y-1">
                {driverInfo && (
                  <p className="text-xs text-muted-foreground">
                    ⭐ {driverInfo.driverRating?.toFixed(1) || "New"} •{" "}
                    {driverInfo.ridesCompleted} rides
                  </p>
                )}
                {driverInfo?.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone size={12} />
                    {driverInfo.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {driverInfo?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => makePhoneCall(driverInfo.phone!)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Phone size={16} />
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Info size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ride/Booking Info */}
      {(rideInfo || bookingInfo) && (
        <div className="max-w-md mx-auto px-4 pt-2">
          {rideInfo && (
            <Card>
              <CardContent className="p-4 py-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">
                      Ride Details
                    </h3>
                    {bookingInfo && (
                      <Badge
                        className={getStatusBadgeColor(bookingInfo.status)}
                      >
                        {bookingInfo.status.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {rideInfo.fromLocation} → {rideInfo.toLocation}
                    </p>
                    <p>
                      {format(new Date(rideInfo.departureDate), "PPP")} at{" "}
                      {rideInfo.departureTime}
                    </p>
                    <p>
                      ₹{rideInfo.price} per seat{" "}
                      {bookingInfo &&
                        `• ${bookingInfo.numSeats} seat(s) booked`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === session?.user?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.senderId === session?.user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === session?.user?.id
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(new Date(message.createdAt), "HH:mm")}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-muted border-t">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 h-12">
            <Input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border-none shadow-none h-full focus-visible:ring-0 focus-visible:ring-offset-0"
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
              size="icon"
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

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    </div>
  );
}

export default function DirectMessagePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DirectMessageContent />
    </Suspense>
  );
}
