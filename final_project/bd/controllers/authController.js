import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ---------------- SIGNUP (Without bcrypt) ----------------
export const signup = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields required" 
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

    // Store plain password (temporary - install bcrypt later)
    const newUser = new User({ 
      name, 
      email, 
      mobile,
      password // Store as plain text temporarily
    });
    
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      message: "Signup successful",
      token,
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email,
        mobile: newUser.mobile
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ---------------- LOGIN (Without bcrypt) ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Simple password comparison (temporary)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        mobile: user.mobile
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};