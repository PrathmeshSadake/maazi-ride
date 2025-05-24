"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, User } from "lucide-react";
import { format } from "date-fns";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  bookingId?: string;
  sender: {
    firstName: string;
    lastName: string;
  };
  receiver: {
    firstName: string;
    lastName: string;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Get driver and ride info from query params
  const driverName = searchParams.get("driver");
  const rideId = searchParams.get("rideId");
  const bookingId = searchParams.get("bookingId");
  const driverId = searchParams.get("driverId");

  useEffect(() => {
    if (status !== "loading") {
      if (!session?.user) {
        router.push("/sign-in");
      } else {
        if (bookingId) {
          fetchMessages();
        } else if (driverId) {
          // For direct driver messages without booking
          fetchDriverMessages();
        }
        setupPusher();
      }
    }

    return () => {
      // Clean up Pusher subscription when component unmounts
      if (!session?.user) {
        pusherClient.unsubscribe(`user-${session?.user!.id}`);
      }
    };
  }, [status, session, router, bookingId, driverId]);

  const setupPusher = () => {
    if (!session?.user) return;

    // Enable Pusher client logging
    pusherClient.connection.bind("error", (err: any) => {
      console.error("Pusher connection error:", err);
    });

    pusherClient.connection.bind("connected", () => {
      console.log("Pusher connected successfully");
    });

    const channel = pusherClient.subscribe(`user-${session?.user!.id}`);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log(
        `Successfully subscribed to user-${session?.user!.id} channel`
      );
    });

    channel.bind("pusher:subscription_error", (error: any) => {
      console.error(
        `Error subscribing to user-${session?.user!.id} channel:`,
        error
      );
    });

    channel.bind("new-message", (data: { message: Message }) => {
      console.log("Received new message via Pusher:", data);
      if (bookingId && data.message.bookingId === bookingId) {
        // Add the new message to the list if it belongs to this booking
        setMessages((prev) => [...prev, data.message]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  };

  const fetchMessages = async () => {
    if (!bookingId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/messages?bookingId=${bookingId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverMessages = async () => {
    if (!driverId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/messages?userId=${driverId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    console.log("sendMessage called with:", {
      messageText,
      user: !session?.user!,
      bookingId,
      driverId,
    });

    if (!messageText.trim() || !session?.user) {
      console.log("Send message aborted due to missing message or user:", {
        noMessageText: !messageText.trim(),
        noUser: !session?.user,
      });
      return;
    }

    // We need either a bookingId or driverId
    if (!bookingId && !driverId) {
      console.log(
        "Send message aborted due to missing both bookingId and driverId"
      );
      return;
    }

    setSending(true);
    try {
      console.log("Sending message to API...");

      // Prepare request payload
      const payload: any = {
        content: messageText,
      };

      // Add either bookingId or receiverId depending on what we have
      if (bookingId) {
        payload.bookingId = bookingId;
      } else if (driverId) {
        payload.receiverId = driverId;
      }

      console.log("Request payload:", payload);

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response not OK:", response.status, errorText);
        throw new Error(
          `Failed to send message: ${response.status} ${errorText}`
        );
      }

      // Add the new message to the list
      const data = await response.json();
      console.log("Message sent successfully:", data);
      setMessages((prev) => [...prev, data]);
      setMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const goBack = () => {
    router.back();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm");
  };

  // For UI demo, show a placeholder if no actual messages yet
  const displayMessages =
    messages.length > 0
      ? messages
      : driverName
      ? [
          {
            id: "placeholder",
            content: `Hi! I'm interested in your ride. Is it still available?`,
            senderId: !session?.user!.id,
            receiverId: "driver",
            createdAt: new Date().toISOString(),
            sender: {
              name: !session?.user?.name,
            },
            receiver: { name: driverName },
          },
        ]
      : [];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button
          onClick={goBack}
          className="p-2 rounded-full hover:bg-gray-100 mr-2"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mr-3">
            <User size={18} />
          </div>
          <div>
            <h1 className="font-medium">{driverName || "Driver"}</h1>
            {rideId && (
              <p className="text-xs text-gray-500">
                Ride #{rideId.slice(0, 8)}
              </p>
            )}
            {bookingId && !rideId && (
              <p className="text-xs text-gray-500">
                Booking #{bookingId.slice(0, 8)}
              </p>
            )}
            {driverId && !bookingId && !rideId && (
              <p className="text-xs text-gray-500">Direct message</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          displayMessages.map((message) => {
            const isCurrentUser = message.senderId === !session?.user!.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isCurrentUser ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-3 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            onClick={() => {
              console.log("Send button clicked");
              sendMessage();
            }}
            disabled={sending || !messageText.trim()}
            className={`ml-2 p-2 rounded-full ${
              sending || !messageText.trim()
                ? "bg-gray-200 text-gray-500"
                : "bg-blue-600 text-white"
            }`}
          >
            <Send size={18} className={sending ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
