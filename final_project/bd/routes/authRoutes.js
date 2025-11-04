import express from "express";
import { signup, login } from "../controllers/authController.js";
import { 
  sendSignupOTP, 
  sendLoginOTP, 
  verifySignupOTP, 
  loginWithOTP,
  resendOTP 
} from "../controllers/otpController.js";

const router = express.Router();

// ✅ Existing routes
router.post("/signup", signup);
router.post("/login", login);

// ✅ New OTP routes
router.post("/send-signup-otp", sendSignupOTP);
router.post("/send-login-otp", sendLoginOTP);
router.post("/verify-signup", verifySignupOTP);
router.post("/login-with-otp", loginWithOTP);
router.post("/resend-otp", resendOTP);

export default router;