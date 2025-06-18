"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";

export default function NotificationListener() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userId = session.user.id;
      console.log("Setting up notification listener for user:", userId);

      // Subscribe to user's notification channel
      const channel = pusherClient.subscribe(`user-${userId}`);

      // Listen for new notifications
      channel.bind("new-notification", (data: { notification: any }) => {
        console.log("Received notification via Pusher:", data);
        const notification = data.notification;

        // Show browser notification if supported
        if (typeof window !== "undefined" && "Notification" in window) {
          // Request permission if not already granted
          if (Notification.permission === "default") {
            Notification.requestPermission();
          }

          // Show notification if permission is granted
          if (Notification.permission === "granted") {
            new Notification(notification.title, {
              body: notification.message,
              icon: "/images/logo.png",
              tag: notification.id,
            });
          }
        }

        // Show toast notification
        if (notification.type === "booking_status") {
          if (notification.title.includes("confirmed")) {
            toast.success(notification.title, {
              description: notification.message,
              duration: 5000,
            });
          } else if (notification.title.includes("rejected")) {
            toast.error(notification.title, {
              description: notification.message,
              duration: 5000,
            });
          } else {
            toast.info(notification.title, {
              description: notification.message,
              duration: 5000,
            });
          }
        } else {
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
          });
        }
      });

      // Listen for new messages (for refreshing conversations)
      channel.bind("new-message", (data: { message: any }) => {
        console.log("Received new message via Pusher:", data);
        // Trigger a custom event that pages can listen to
        window.dispatchEvent(
          new CustomEvent("pusher-new-message", { detail: data })
        );
      });

      channel.bind("pusher:subscription_succeeded", () => {
        console.log(
          `Successfully subscribed to user-${userId} notification channel`
        );
      });

      channel.bind("pusher:subscription_error", (error: any) => {
        console.error("Error subscribing to notification channel:", error);
      });

      // Cleanup function
      return () => {
        console.log(
          "Unsubscribing from notification channel for user:",
          userId
        );
        pusherClient.unsubscribe(`user-${userId}`);
      };
    }
  }, [status, session]);

  // This component doesn't render anything visible
  return null;
}
