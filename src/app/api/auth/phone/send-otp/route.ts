import { NextRequest, NextResponse } from "next/server";
import { TwilioService } from "@/lib/twilio";
import { z } from "zod";

const sendOTPSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const { phoneNumber } = sendOTPSchema.parse(body);

    // Format phone number to E.164 format if not already
    let formattedPhone = phoneNumber.replace(/\D/g, ""); // Remove non-digits

    // Add country code if not present (assuming India +91 by default)
    if (!formattedPhone.startsWith("91") && formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    }

    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    // Send OTP using Twilio
    const result = await TwilioService.sendOTP(formattedPhone);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        phoneNumber: formattedPhone,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Send OTP error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number format",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}
