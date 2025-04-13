import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", {
      status: 400,
    });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with ID: ${id} and type: ${eventType}`);
  console.log("Webhook data:", JSON.stringify(evt.data, null, 2));

  // Handle different event types
  if (eventType === "user.created") {
    const {
      id,
      email_addresses,
      phone_numbers,
      first_name,
      last_name,
      public_metadata,
    } = evt.data;

    // Access last_sign_in_url safely with type assertion
    const last_sign_in_url = (evt.data as any).last_sign_in_url;

    if (!id) {
      console.error("Error: Missing user ID in webhook data");
      return NextResponse.json(
        { error: "Missing user ID in webhook data" },
        { status: 422 }
      );
    }

    // Check if this user was created through our signup flow with role parameter
    // If there's a last_sign_in_url, we can extract the role from it if present
    let role = "user";
    let isVerified = true;

    if (
      public_metadata &&
      typeof public_metadata === "object" &&
      public_metadata.role
    ) {
      // If metadata already has role, use that (set from setup page)
      role = public_metadata.role as string;
      isVerified = role === "user" ? true : false;
    } else if (last_sign_in_url) {
      // Try to extract role from the URL if user signed up with our flow
      try {
        const url = new URL(last_sign_in_url);
        const roleParam = url.searchParams.get("role");
        if (
          roleParam &&
          (roleParam === "driver" ||
            roleParam === "user" ||
            roleParam === "admin")
        ) {
          role = roleParam;
          isVerified = role === "user" ? true : false;
        }
      } catch (e) {
        console.error("Failed to parse sign-in URL:", e);
      }
    }

    const email = email_addresses?.[0]?.email_address || null;
    const phoneNumber = phone_numbers?.[0]?.phone_number || null;

    try {
      // Create a new user in the database
      await prisma.user.create({
        data: {
          id,
          email,
          phoneNumber,
          firstName: first_name || null,
          lastName: last_name || null,
          role: role as any,
          isVerified,
        },
      });

      console.log(
        `User ${id} created successfully in the database with role: ${role}`
      );
    } catch (error) {
      console.error("Error creating user in database:", error);
      return NextResponse.json(
        { error: "Error creating user", details: error },
        { status: 500 }
      );
    }
  } else if (eventType === "user.updated") {
    const {
      id,
      email_addresses,
      phone_numbers,
      first_name,
      last_name,
      public_metadata,
    } = evt.data;

    if (!id) {
      console.error("Error: Missing user ID in webhook data");
      return NextResponse.json(
        { error: "Missing user ID in webhook data" },
        { status: 422 }
      );
    }

    // Update values based on metadata
    const role = (public_metadata?.role as string) || "user";
    const isVerified =
      (public_metadata?.isVerified as boolean) ??
      (role === "user" ? true : false);
    const email = email_addresses?.[0]?.email_address || null;
    const phoneNumber = phone_numbers?.[0]?.phone_number || null;

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (existingUser) {
        // Update the user in the database
        await prisma.user.update({
          where: { id },
          data: {
            email,
            phoneNumber,
            firstName: first_name || null,
            lastName: last_name || null,
            role: role as any,
            isVerified,
          },
        });

        console.log(
          `User ${id} updated successfully in the database with role: ${role}`
        );
      } else {
        // Create the user if they don't exist (this can happen if the webhook fails on creation)
        await prisma.user.create({
          data: {
            id,
            email,
            phoneNumber,
            firstName: first_name || null,
            lastName: last_name || null,
            role: role as any,
            isVerified,
          },
        });

        console.log(
          `User ${id} created successfully in the database during update webhook with role: ${role}`
        );
      }
    } catch (error) {
      console.error("Error updating user in database:", error);
      return NextResponse.json(
        { error: "Error updating user", details: error },
        { status: 500 }
      );
    }
  } else if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      console.error("Error: Missing user ID in webhook data");
      return NextResponse.json(
        { error: "Missing user ID in webhook data" },
        { status: 422 }
      );
    }

    try {
      // Delete the user from the database
      await prisma.user.delete({
        where: { id },
      });

      console.log(`User ${id} deleted successfully from the database`);
    } catch (error) {
      console.error("Error deleting user from database:", error);
      return NextResponse.json(
        { error: "Error deleting user", details: error },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
