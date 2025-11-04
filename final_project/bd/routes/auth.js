import express from "express";
import { OTPService } from "../services/otpService.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ Send OTP for signup
router.post("/send-signup-otp", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Valid 10-digit mobile number required"
      });
    }

    // Check if mobile already registered
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    const result = await OTPService.createAndSendOTP(mobile, "signup");

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: result.message,
      otp: result.otp // Only in development
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
});

// ✅ Send OTP for login
router.post("/send-login-otp", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Valid 10-digit mobile number required"
      });
    }

    // Check if mobile exists
    const existingUser = await User.findOne({ mobile });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Mobile number not registered"
      });
    }

    const result = await OTPService.createAndSendOTP(mobile, "login");

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: result.message,
      otp: result.otp // Only in development
    });
  } catch (error) {
    console.error("Send login OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
});

// ✅ NEW: Verify OTP only (without signup)
router.post("/verify-otp-only", async (req, res) => {
  try {
    const { mobile, otp, purpose } = req.body;

    if (!mobile || !otp || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Mobile, OTP and purpose are required"
      });
    }

    // Verify OTP
    const otpResult = await OTPService.verifyOTP(mobile, otp, purpose);
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully"
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed"
    });
  }
});

// ✅ NEW: Complete signup after OTP verification
router.post("/complete-signup", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Check if mobile already exists
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      mobile,
      password,
      mobileVerified: true
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error("Complete signup error:", error);
    res.status(500).json({
      success: false,
      message: "Signup failed"
    });
  }
});

// ✅ OLD: Verify OTP and signup (combined - for backward compatibility)
router.post("/verify-signup", async (req, res) => {
  try {
    const { name, email, mobile, password, otp } = req.body;

    if (!name || !email || !mobile || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Verify OTP
    const otpResult = await OTPService.verifyOTP(mobile, otp, "signup");
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Check if mobile already exists
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      mobile,
      password,
      mobileVerified: true
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Signup failed"
    });
  }
});

// ✅ Login with OTP
router.post("/login-with-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile and OTP are required"
      });
    }

    // Verify OTP
    const otpResult = await OTPService.verifyOTP(mobile, otp, "login");
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    // Find user
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error("Login with OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// ✅ Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { mobile, purpose } = req.body;
    
    if (!mobile || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Mobile and purpose are required"
      });
    }

    const result = await OTPService.resendOTP(mobile, purpose);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP"
    });
  }
});

export default router;