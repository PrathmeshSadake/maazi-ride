import Pusher from "pusher";
import PusherClient from "pusher-js";

// Check if environment variables are available
const pusherServerKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherServerCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
const pusherServerAppId = process.env.PUSHER_APP_ID;
const pusherServerSecret = process.env.PUSHER_SECRET;

if (
  !pusherServerKey ||
  !pusherServerCluster ||
  !pusherServerAppId ||
  !pusherServerSecret
) {
  console.error("Missing Pusher environment variables:", {
    key: pusherServerKey ? "✓" : "✗",
    cluster: pusherServerCluster ? "✓" : "✗",
    appId: pusherServerAppId ? "✓" : "✗",
    secret: pusherServerSecret ? "✓" : "✗",
  });
}

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: pusherServerAppId!,
  key: pusherServerKey!,
  secret: pusherServerSecret!,
  cluster: pusherServerCluster!,
  useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = new PusherClient(pusherServerKey!, {
  cluster: pusherServerCluster!,
  enabledTransports: ["ws", "wss"],
});
