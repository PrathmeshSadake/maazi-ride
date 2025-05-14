"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, ArrowLeft, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    rideUpdates: true,
    messages: true,
    marketing: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");

      // Update UI
      setNotifications(
        notifications.map((n: any) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete notification");

      // Update UI
      setNotifications(notifications.filter((n: any) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const updateSetting = (key: string, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    // Here you would also update this on the server
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>

        {[1, 2, 3].map((_, i) => (
          <div key={i} className="mb-4">
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-medium mb-4">Notification Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="rideUpdates">Ride Updates</Label>
              <p className="text-sm text-gray-500">Updates about your rides</p>
            </div>
            <Switch
              id="rideUpdates"
              checked={settings.rideUpdates}
              onCheckedChange={(checked) =>
                updateSetting("rideUpdates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="messages">Messages</Label>
              <p className="text-sm text-gray-500">New message alerts</p>
            </div>
            <Switch
              id="messages"
              checked={settings.messages}
              onCheckedChange={(checked) => updateSetting("messages", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing">Marketing</Label>
              <p className="text-sm text-gray-500">Deals and promotions</p>
            </div>
            <Switch
              id="marketing"
              checked={settings.marketing}
              onCheckedChange={(checked) => updateSetting("marketing", checked)}
            />
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <h2 className="text-lg font-medium p-4 border-b border-gray-200">
          Recent Notifications
        </h2>

        {notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 ${
                !notification.read ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check size={16} className="text-green-600" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
