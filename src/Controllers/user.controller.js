// controllers/userController.js

import userModel from "../Models/users.models.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Cookie configuration for cross-origin
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true in production
  sameSite: 'None', // Required for cross-origin cookies
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
});

// Register Controller - Now automatically logs in user after registration
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
    
    const existingUserName = await userModel.findOne({ name });
    if (existingUserName) {
      return res.status(400).json({ error: "User already exists with this username." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      mobileNo,
      password: hashedPassword,
      isOnline: true
    });

    // Create JWT token after registration
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.SEC_KEY || "default_secret",
      { expiresIn: '7d' }
    );

    // Set token in cookie with consistent options
    res.cookie("token", token, getCookieOptions());

    console.log("User registered and logged in:", user.name);

    res.status(201).json({
      message: "User registration and login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo
      },
      token // Include token in response for debugging
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

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Update user online status
    await userModel.findByIdAndUpdate(user._id, { isOnline: true });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.SEC_KEY || "default_secret",
      { expiresIn: "7d" }
    );

    // Set token in cookie with consistent options
    res.cookie("token", token, getCookieOptions());

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token // Include token in response for debugging
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get Me Controller
export const getMeController = async(req, res) => {
  try {
    if (req.user) {
      const user = await userModel.findById(req.user.id)
        .select('-password')
        .lean();
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ 
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        isOnline: user.isOnline
      });
    } else {
      res.status(401).json({ error: 'Unauthorized - No user found' });
    }
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Logout Controller
export const logoutUserController = async (req, res) => {
  try {
    if (req.user?.id) {
      await userModel.findByIdAndUpdate(req.user.id, { 
        isOnline: false,
        lastSeen: new Date()
      });
    }

    // Clear cookie with same options as set
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None', // Match the sameSite setting
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed"
    });
  }
};

// Enhanced Token Verification Middleware
export async function verifyTokenMiddleware(req, res, next) {
  try {
    const token = req.cookies['token'];
    
    console.log("Token from cookie:", token ? "Token present" : "No token found");
    console.log("All cookies:", req.cookies);
    
    if (!token) {
      return res.status(401).json({ 
        error: "Access denied. No token provided.",
        debug: "Cookie not found" 
      });
    }
    
    const decoded = jwt.verify(token, process.env.SEC_KEY || "default_secret");
    
    // Check if user still exists in database
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found in database" });
    }
    
    // Add user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || user.name,
      username: user.username
    };
    
    console.log("Token verified for user:", req.user.name);
    next();
    
  } catch (err) {
    console.error("Token verification error:", err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.status(401).json({ 
      error: "Token verification failed",
      debug: err.message 
    });
  }
}

// Get current user info (for the /me endpoint)
export async function getCurrentUserController(req, res) {
  try {
    const user = await userModel.findById(req.user.id)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
}

// Get all users (for chat user list)
export async function getAllUsersController(req, res) {
  try {
    const users = await userModel.find({}, 'name email isOnline lastSeen').lean();
    const usernames = users.map(user => user.name);
    res.status(200).json(usernames);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}