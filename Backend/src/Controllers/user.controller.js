// controllers/userController.js

import userModel from "../Models/users.models.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from "cookie-parser";

// Register Controller
export async function registerUserController(req, res) {
  try {
    const { name, email, password, mobileNo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      mobileNo,
      password: hashedPassword,
      isOnline: false
    });

    // const token = jwt.sign(
    //   { id: user._id, email: user.email },
    //   process.env.SEC_KEY || "default_secret", // Fallback if SEC_KEY is undefined
    //   { expiresIn: '24h' }
    // );

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 24 * 60 * 60 * 1000,
    //   path: '/'
    // });

    console.log("User registered:", user.name);

    res.status(201).json({
      message: "User registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo
      },
      // token
    });

  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Internal server error during registration" });
  }
}

// Login Controller
export async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SEC_KEY || "default_secret",
      { expiresIn: "1d" }
    );

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Logout Controller
export async function logoutUserController(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ error: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.SEC_KEY || "default_secret");
    await userModel.findByIdAndUpdate(decoded.id, { isOnline: false });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    res.status(200).json({
      message: "Logout successful"
    });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ error: "Internal server error during logout" });
  }
}

// Middleware to Verify JWT Token from Cookie
export async function verifyTokenMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.SEC_KEY || "default_secret");
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}
