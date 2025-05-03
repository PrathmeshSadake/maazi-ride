import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

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
      unsafe_metadata,
    } = evt.data;

    if (!id) {
      console.error("Error: Missing user ID in webhook data");
      return NextResponse.json(
        { error: "Missing user ID in webhook data" },
        { status: 422 }
      );
    }

    // Extract role from unsafe_metadata
    // Default to "user" role and verified for users, drivers are not verified by default
    let role = "user";
    let isVerified = true;

    if (unsafe_metadata && typeof unsafe_metadata === "object") {
      // Check for role in unsafe metadata
      if (unsafe_metadata.role) {
        role = unsafe_metadata.role as string;

        // Set isVerified based on role (only users are verified by default)
        isVerified = role === "user" ? true : false;
      }
    }

    // Check if isVerified is explicitly set in public metadata
    if (
      public_metadata &&
      typeof public_metadata === "object" &&
      public_metadata.isVerified !== undefined
    ) {
      isVerified = public_metadata.isVerified as boolean;
    }

    const email = email_addresses?.[0]?.email_address || null;
    const phoneNumber = phone_numbers?.[0]?.phone_number || null;

    try {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          role,
          isVerified,
        },
      });
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
        `User ${id} created successfully in the database with role: ${role}, isVerified: ${isVerified}`
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
      unsafe_metadata,
    } = evt.data;

    if (!id) {
      console.error("Error: Missing user ID in webhook data");
      return NextResponse.json(
        { error: "Missing user ID in webhook data" },
        { status: 422 }
      );
    }

    const userByEmail = await prisma.user.findUnique({
      where: { email: email_addresses?.[0]?.email_address },
    });

    // Handle metadata updates properly
    let role = userByEmail?.role || ("user" as string);
    let isVerified = true;

    if (unsafe_metadata && typeof unsafe_metadata === "object") {
      // Check for role in unsafe metadata
      if (unsafe_metadata.role) {
        role = unsafe_metadata.role as string;

        // Set isVerified based on role (only users are verified by default)
        isVerified = role === "user" ? true : false;
      }
    }

    // Check if isVerified is explicitly set in public metadata
    if (
      public_metadata &&
      typeof public_metadata === "object" &&
      public_metadata.isVerified !== undefined
    ) {
      isVerified = public_metadata.isVerified as boolean;
    }

    const email = email_addresses?.[0]?.email_address || undefined;
    const phoneNumber = phone_numbers?.[0]?.phone_number || undefined;

    try {
      // Update the Clerk metadata
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          role,
          isVerified,
        },
      });

      // Try to find user by ID first
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (existingUser) {
        // User exists, update it
        await prisma.user.update({
          where: { id },
          data: {
            firstName: first_name || undefined,
            lastName: last_name || undefined,
            role: role as any,
            isVerified,
            ...(email && { email }), // Only include if email exists
            ...(phoneNumber && { phoneNumber }), // Only include if phoneNumber exists
          },
        });
        console.log(`User ${id} updated successfully in the database`);
      } else {
        // User doesn't exist by ID
        // If email is provided, check if a user with this email already exists
        if (email) {
          const userByEmail = await prisma.user.findUnique({
            where: { email },
          });

          if (userByEmail) {
            // Update the existing user with this email to use the new ID
            await prisma.user.update({
              where: { email },
              data: {
                id, // Update to current Clerk ID
                firstName: first_name || undefined,
                lastName: last_name || undefined,
                role: role as any,
                isVerified,
                ...(phoneNumber && { phoneNumber }),
              },
            });
            console.log(
              `Updated existing user with email ${email} to have ID ${id}`
            );
          } else {
            // No user with this ID or email, create a new one
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
            console.log(`Created new user with ID ${id}`);
          }
        } else {
          // No email provided, just create with ID
          await prisma.user.create({
            data: {
              id,
              firstName: first_name || null,
              lastName: last_name || null,
              role: role as any,
              isVerified,
            },
          });
          console.log(`Created new user with ID ${id} (no email provided)`);
        }
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
