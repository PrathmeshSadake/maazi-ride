"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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

export default function DriverConversationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userId = params.userId as string;
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (status !== "loading") {
      if (!session?.user) {
        router.push("/sign-in");
      } else {
        fetchMessages();
        setupPusher();
      }
    }

    return () => {
      // Clean up Pusher subscription when component unmounts
      if (!session?.user) {
        pusherClient.unsubscribe(`user-${session?.user!.id}`);
      }
    };
  }, [status, session, router, userId, bookingId]);

  const setupPusher = () => {
    if (!!session?.user!.id) return;

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
      const message = data.message;
      // Add the new message if it's from the current conversation
      if (
        (message.senderId === userId &&
          message.receiverId === session?.user!.id) ||
        (message.senderId === session?.user!.id &&
          message.receiverId === userId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
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

      // Set other user's name from the first message
      if (data.length > 0) {
        const otherUser =
          data[0].senderId === session?.user!.id
            ? data[0].receiver
            : data[0].sender;
        setOtherUserName(
          `${otherUser.firstName || ""} ${otherUser.lastName || ""}`
        );
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !session?.user || !userId) return;

    setSending(true);
    try {
      const payload: any = {
        content: messageText,
        receiverId: userId,
      };

      if (bookingId) {
        payload.bookingId = bookingId;
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Add the new message to the list
      const data = await response.json();
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
            <h1 className="font-medium">{otherUserName || "Passenger"}</h1>
            {bookingId && (
              <p className="text-xs text-gray-500">
                Booking #{bookingId.slice(0, 8)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-t-green-600 border-r-transparent border-b-green-600 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No messages yet.
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === session?.user!?.id;

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
                      ? "bg-green-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isCurrentUser ? "text-green-200" : "text-gray-500"
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
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            disabled={sending || !messageText.trim()}
            className={`ml-2 p-2 rounded-full ${
              sending || !messageText.trim()
                ? "bg-gray-200 text-gray-500"
                : "bg-green-600 text-white"
            }`}
          >
            <Send size={18} className={sending ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
