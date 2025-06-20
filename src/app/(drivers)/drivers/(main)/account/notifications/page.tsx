"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Settings2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Car,
  Calendar,
  Clock,
  Check,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">(
    "notifications"
  );
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    rideRequests: true,
    paymentUpdates: true,
    systemUpdates: true,
    promotions: false,
  });

  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      if (status !== "loading" && !session?.user) return;

      try {
        // Mocked data for demonstration
        const mockNotifications: Notification[] = [
          {
            id: "1",
            title: "New Ride Request",
            message: "You have a new ride request from Mumbai to Pune.",
            type: "ride_request",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: "2",
            title: "Document Verified",
            message: "Your driving license has been verified successfully.",
            type: "document_verified",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          },
          {
            id: "3",
            title: "Payment Received",
            message: "You received a payment of ₹550 for ride #12345.",
            type: "payment",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: "4",
            title: "New Message",
            message:
              "You have a new message from Raj regarding the upcoming ride.",
            type: "message",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          },
        ];

        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [status, session]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ride_request":
      case "ride_cancelled":
        return <Car className="w-4 h-4 text-blue-500" />;
      case "document_verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "payment":
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Toggle notification settings
  const toggleSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Format relative time
  const formatTime = (dateString: string) => {
    const now = new Date();
    const time = new Date(dateString);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 pt-8 pb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
        </div>
        <div className="px-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
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
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "notifications"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "settings"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="px-4 pb-6">
        {activeTab === "notifications" ? (
          <div className="space-y-4 mt-4">
            {/* Notification header with actions */}
            {notifications.length > 0 && (
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-medium text-gray-900">
                    Recent
                  </h2>
                  <p className="text-xs text-gray-500">
                    {notifications.filter((n) => !n.read).length} unread
                  </p>
                </div>

                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            )}

            {/* Notifications list */}
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl p-4 ${
                      !notification.read ? "ring-2 ring-blue-100" : ""
                    }`}
                  >
                    <div className="flex">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>

                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500 text-sm">
                  We'll notify you when something important happens
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Settings Tab */
          <div className="space-y-4 mt-4">
            {/* Notification Channels */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  Notification Channels
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {[
                  {
                    key: "pushEnabled",
                    label: "Push Notifications",
                    description: "Receive notifications on your device",
                  },
                  {
                    key: "emailEnabled",
                    label: "Email Notifications",
                    description: "Get updates via email",
                  },
                  {
                    key: "smsEnabled",
                    label: "SMS Notifications",
                    description: "Receive text messages for important updates",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        toggleSetting(
                          item.key as keyof typeof notificationSettings
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings[
                          item.key as keyof typeof notificationSettings
                        ]
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings[
                            item.key as keyof typeof notificationSettings
                          ]
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Types */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  Notification Types
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {[
                  {
                    key: "rideRequests",
                    label: "Ride Requests",
                    description: "New ride requests and bookings",
                  },
                  {
                    key: "paymentUpdates",
                    label: "Payment Updates",
                    description: "Payment confirmations and receipts",
                  },
                  {
                    key: "systemUpdates",
                    label: "System Updates",
                    description: "App updates and system maintenance",
                  },
                  {
                    key: "promotions",
                    label: "Promotions & Offers",
                    description: "Special offers and promotional content",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        toggleSetting(
                          item.key as keyof typeof notificationSettings
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings[
                          item.key as keyof typeof notificationSettings
                        ]
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings[
                            item.key as keyof typeof notificationSettings
                          ]
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors">
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
