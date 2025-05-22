import userModel from "../Models/users.models.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function registerUserController(req, res) {
  try {
    const { name, email, password, mobileNo } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const hassPassword = await bcrypt.hash(password, 10);
    
    const user = await userModel.create({
      name,
      email,
      mobileNo,
      password: hassPassword,
    
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SEC_KEY,
      { expiresIn: '24h' } // Extended expiry time
    );

    // Set cookie with proper options
    res.cookie("token", token, {
      httpOnly: true,        // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',       // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: '/'              // Available on all routes
    });

    console.log("User registered:", user.name);
    console.log("Token set in cookie");
    
    res.status(201).json({
      message: "User registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo
      },
      token // Also send in response for frontend storage if needed
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error during registration" });
  }
}

export async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const isUser = await userModel.findOne({ email });
    if (!isUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const matchPassword = await bcrypt.compare(password, isUser.password);
    if (!matchPassword) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    //  Check if user is already online
    if (isUser.isOnline) {
      return res.status(403).json({
        message: `User ${email} is already logged in`
      });
    }

    //  Update user online status
    await userModel.findByIdAndUpdate(isUser._id, { isOnline: true });

    //  Generate JWT token
    const token = jwt.sign(
      { id: isUser._id, email: isUser.email },
      process.env.SEC_KEY,
      { expiresIn: '24h' }
    );

    //  Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    console.log("User logged in:", isUser.name);
    console.log("Token set in cookie");

    res.status(200).json({
      message: "Login successful",
      isOnline:true,
      user: {
        id: isUser._id,
        name: isUser.name,
        email: isUser.email
      },
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
}


// Logout controller to clear cookie
export async function logoutUserController(req, res) {
  try {
    // Clear the cookie
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
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error during logout" });
  }
}

// Middleware to verify token from cookie
export async function verifyTokenMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.SEC_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}