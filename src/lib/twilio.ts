// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio"; // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !serviceSid) {
  throw new Error("Missing Twilio environment variables");
}

const client = twilio(accountSid, authToken);

export interface OTPResponse {
  success: boolean;
  message: string;
  sid?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  valid?: boolean;
}

export class TwilioService {
  static async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      // Ensure phone number is in E.164 format
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      const verification = await client.verify.v2
        .services(serviceSid!)
        .verifications.create({
          to: formattedPhone,
          channel: "sms",
        });

      return {
        success: true,
        message: "OTP sent successfully",
        sid: verification.sid,
      };
    } catch (error: any) {
      console.error("Twilio OTP send error:", error);
      return {
        success: false,
        message: error.message || "Failed to send OTP",
      };
    }
  }

  static async verifyOTP(
    phoneNumber: string,
    code: string
  ): Promise<VerifyOTPResponse> {
    try {
      // Ensure phone number is in E.164 format
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      const verificationCheck = await client.verify.v2
        .services(serviceSid!)
        .verificationChecks.create({
          to: formattedPhone,
          code: code,
        });

      return {
        success: verificationCheck.status === "approved",
        message:
          verificationCheck.status === "approved"
            ? "OTP verified successfully"
            : "Invalid OTP",
        valid: verificationCheck.status === "approved",
      };
    } catch (error: any) {
      console.error("Twilio OTP verify error:", error);
      return {
        success: false,
        message: error.message || "Failed to verify OTP",
      };
    }
  }
}
