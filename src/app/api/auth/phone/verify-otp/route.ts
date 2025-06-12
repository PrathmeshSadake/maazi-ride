import { NextRequest, NextResponse } from "next/server";
import { TwilioService } from "@/lib/twilio";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const verifyOTPSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  action: z.enum(["signup", "signin", "verify"]), // Different actions for OTP verification
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  role: z.enum(["user", "driver"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const { phoneNumber, otp, action, name, email, password, role } =
      verifyOTPSchema.parse(body);

    // Format phone number to E.164 format if not already
    let formattedPhone = phoneNumber.replace(/\D/g, ""); // Remove non-digits

    // Add country code if not present (assuming India +91 by default)
    if (!formattedPhone.startsWith("91") && formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    }

    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    // Verify OTP using Twilio
    const verificationResult = await TwilioService.verifyOTP(
      formattedPhone,
      otp
    );

    if (!verificationResult.success || !verificationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          message: verificationResult.message,
        },
        { status: 400 }
      );
    }

    // Handle different actions after successful OTP verification
    switch (action) {
      case "signup":
        // Create new user with verified phone
        if (!name || !email || !password || !role) {
          return NextResponse.json(
            {
              success: false,
              message: "Missing required fields for signup",
            },
            { status: 400 }
          );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email: email }, { phone: formattedPhone }],
          },
        });

        if (existingUser) {
          return NextResponse.json(
            {
              success: false,
              message: "User already exists with this email or phone number",
            },
            { status: 400 }
          );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            phone: formattedPhone,
            phoneVerified: true,
            role: role as "user" | "driver",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Account created successfully",
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
          },
        });

      case "signin":
        // Find user by phone number
        const user = await prisma.user.findUnique({
          where: { phone: formattedPhone },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            phoneVerified: true,
          },
        });

        if (!user) {
          return NextResponse.json(
            {
              success: false,
              message: "No account found with this phone number",
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Phone number verified successfully",
          user,
        });

      case "verify":
        // Just verify the phone number and update the user's phone verification status
        const userToVerify = await prisma.user.findUnique({
          where: { phone: formattedPhone },
        });

        if (!userToVerify) {
          return NextResponse.json(
            {
              success: false,
              message: "No account found with this phone number",
            },
            { status: 404 }
          );
        }

        // Update phone verification status
        await prisma.user.update({
          where: { phone: formattedPhone },
          data: { phoneVerified: true },
        });

        return NextResponse.json({
          success: true,
          message: "Phone number verified successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action",
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Verify OTP error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify OTP",
      },
      { status: 500 }
    );
  }
}
