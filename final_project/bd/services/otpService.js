import Otp from "../models/Otp.js";
import twilio from "twilio";

// Twilio configuration (you can use other SMS services too)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class OTPService {
  // Generate random 6-digit OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via SMS
  static async sendOTP(mobile, otp) {
    try {
      // For development - just log the OTP
      if (process.env.NODE_ENV === "development") {
        console.log(`OTP for ${mobile}: ${otp}`);
        return { success: true, message: "OTP sent successfully" };
      }

      // For production - send actual SMS
      const message = await twilioClient.messages.create({
        body: `Your verification code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobile}` // Assuming Indian numbers
      });

      return { success: true, message: "OTP sent successfully" };
    } catch (error) {
      console.error("SMS sending failed:", error);
      // Fallback - log OTP for testing
      console.log(`OTP for ${mobile}: ${otp}`);
      return { success: true, message: "OTP logged for development" };
    }
  }

  // Create and send OTP
  static async createAndSendOTP(mobile, purpose) {
    try {
      // Delete any existing OTP for this mobile and purpose
      await Otp.deleteMany({ mobile, purpose });

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      const otpRecord = new Otp({
        mobile,
        otp,
        purpose,
        expiresAt
      });

      await otpRecord.save();

      // Send OTP via SMS
      const smsResult = await this.sendOTP(mobile, otp);

      return {
        success: true,
        message: smsResult.message,
        otp: process.env.NODE_ENV === "development" ? otp : undefined // Return OTP only in development
      };
    } catch (error) {
      console.error("OTP creation failed:", error);
      return { success: false, message: "Failed to send OTP" };
    }
  }

  // Verify OTP
  static async verifyOTP(mobile, otp, purpose) {
    try {
      const otpRecord = await Otp.findOne({
        mobile,
        purpose,
        verified: false
      });

      if (!otpRecord) {
        return { success: false, message: "OTP not found or already used" };
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return { success: false, message: "OTP has expired" };
      }

      // Check if maximum attempts exceeded
      if (otpRecord.attempts >= 3) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return { success: false, message: "Too many failed attempts" };
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return { success: false, message: "Invalid OTP" };
      }

      // Mark OTP as verified and delete it
      otpRecord.verified = true;
      await otpRecord.save();
      await Otp.deleteOne({ _id: otpRecord._id });

      return { success: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("OTP verification failed:", error);
      return { success: false, message: "OTP verification failed" };
    }
  }

  // Resend OTP
  static async resendOTP(mobile, purpose) {
    return await this.createAndSendOTP(mobile, purpose);
  }
}