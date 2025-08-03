"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  User,
  Phone,
  Info,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
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
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      window.open(`tel:${cleanPhone}`, "_self");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">Loading...</p>
            <p className="text-sm text-gray-500">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 flex-1 ml-4">
            <Avatar className="w-10 h-10 border-2 border-purple-100">
              <AvatarFallback className="bg-purple-500 text-white text-sm font-semibold">
                {driverInfo?.name
                  ?.split(" ")
                  .map((n) => n.charAt(0))
                  .join("")
                  .slice(0, 2) || "D"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-gray-900 text-base truncate">
                {driverInfo?.name || "Driver"}
              </h1>
              {driverInfo && (
                <p className="text-xs text-gray-500">
                  ⭐ {driverInfo.driverRating?.toFixed(1) || "New"} •{" "}
                  {driverInfo.ridesCompleted} rides
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {driverInfo?.phone && (
              <button
                onClick={() => makePhoneCall(driverInfo.phone!)}
                className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
              >
                <Phone className="w-4 h-4 text-green-600" />
              </button>
            )}
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ride/Booking Info */}
      {(rideInfo || bookingInfo) && (
        <div className="px-4 pt-3">
          {rideInfo && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Ride Details
                    </h3>
                  </div>
                  {bookingInfo && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusBadgeColor(
                        bookingInfo.status
                      )}`}
                    >
                      {bookingInfo.status.replace("_", " ")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {rideInfo.fromLocation}
                    </span>
                    <span className="text-gray-400">→</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {rideInfo.toLocation}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {format(new Date(rideInfo.departureDate), "PPP")} at{" "}
                      {rideInfo.departureTime}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span>₹{rideInfo.price} per seat</span>
                      {bookingInfo && (
                        <>
                          <span>•</span>
                          <span className="font-medium">
                            {bookingInfo.numSeats} seat(s) booked
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 text-sm">
                Send a message to {driverInfo?.name || "the driver"} about your
                ride.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === session?.user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.senderId === session?.user?.id
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.senderId === session?.user?.id
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {format(new Date(message.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={sending || !messageText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              messageText.trim() && !sending
                ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <Send className={`w-4 h-4 ${sending ? "animate-pulse" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-gray-900">Loading...</p>
          <p className="text-sm text-gray-500">Loading conversation...</p>
        </div>
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
