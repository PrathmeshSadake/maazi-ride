"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Settings,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Car,
  Calendar,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      if (!isLoaded || !user) return;

      try {
        // In a real app, replace this with API call
        // const response = await fetch(`/api/drivers/${user.id}/notifications`);
        // const data = await response.json();

        // Mocked data for demonstration
        const mockNotifications: Notification[] = [
          {
            id: "1",
            title: "New Ride Request",
            message: "You have a new ride request from Mumbai to Pune.",
            type: "ride_request",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
          },
          {
            id: "2",
            title: "Document Verified",
            message: "Your driving license has been verified successfully.",
            type: "document_verified",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          },
          {
            id: "3",
            title: "Payment Received",
            message: "You received a payment of ₹550 for ride #12345.",
            type: "payment",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          },
          {
            id: "4",
            title: "New Message",
            message:
              "You have a new message from Raj regarding the upcoming ride.",
            type: "message",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
          },
          {
            id: "5",
            title: "Ride Cancelled",
            message: "Ride #54321 has been cancelled by the passenger.",
            type: "ride_cancelled",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
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
  }, [isLoaded, user]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // In a real app, make an API call to update the read status
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });

      // Update local state
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
      // In a real app, make an API call to update all as read
      // await fetch(`/api/notifications/read-all`, { method: 'POST' });

      // Update local state
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
        return <Car className="text-blue-500" />;
      case "document_verified":
        return <CheckCircle className="text-green-500" />;
      case "payment":
        return <Calendar className="text-purple-500" />;
      case "message":
        return <MessageSquare className="text-yellow-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  // Toggle notification settings
  const toggleSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button className="px-4 py-2 border-b-2 border-green-500 font-medium text-green-600">
          Notifications
        </button>
        <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
          Settings
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Loading notifications...</div>
      ) : (
        <>
          {/* Notification header with actions */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-medium">Recent Notifications</h2>
              <p className="text-sm text-gray-500">
                {notifications.filter((n) => !n.read).length} unread
                notifications
              </p>
            </div>

            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read
                      ? "bg-white border-gray-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex">
                    <div className="mr-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{notification.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>

                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-green-600 hover:text-green-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          )}
        </>
      )}

      {/* Notification Settings Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Settings className="text-gray-500 mr-2" />
          <h2 className="text-xl font-semibold">Notification Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Notification Channels</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">Email Notifications</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailEnabled}
                    onChange={() => toggleSetting("emailEnabled")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.emailEnabled
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">Push Notifications</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushEnabled}
                    onChange={() => toggleSetting("pushEnabled")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.pushEnabled
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">SMS Notifications</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsEnabled}
                    onChange={() => toggleSetting("smsEnabled")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.smsEnabled
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Notification Types</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">Ride Requests</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={notificationSettings.rideRequests}
                    onChange={() => toggleSetting("rideRequests")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.rideRequests
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">Payment Updates</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={notificationSettings.paymentUpdates}
                    onChange={() => toggleSetting("paymentUpdates")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.paymentUpdates
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">System Updates</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={notificationSettings.systemUpdates}
                    onChange={() => toggleSetting("systemUpdates")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.systemUpdates
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">Promotions & Offers</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={notificationSettings.promotions}
                    onChange={() => toggleSetting("promotions")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.promotions
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #ffffff;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #10b981;
        }
        .toggle-checkbox {
          right: 0;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
}
