import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()


import { toConnectDB } from './src/db/db.js'
import cookieParser from 'cookie-parser'
import routes from './src/Routes/user.routes.js'
import messageModel from './src/Models/chat.models.js'
// Import your user model - adjust the path as needed
import userModel from './src/Models/users.models.js' // You'll need this

const app = express()
const server = createServer(app)

// CORRECTED CORS SETUP
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Home route
app.get("/", (req, res) => {
  res.send("Home")
})

// NEW: Get all registered users
app.get("/user/all-users", async (req, res) => {
  try {
    // Fetch all users from database - adjust field names as per your user model
    const allUsers = await userModel.find({}, { name: 1, email: 1, _id: 0 }); // Only get name and email
    
    const userList = allUsers.map(user => user.name); // Extract just the names
    
    res.json(userList);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Chat history endpoint
app.get("/user/messages", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "senderId and receiverId are required" });
    }

    const messages = await messageModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timeStamp: 1 });

    // Format messages to match frontend expectations
    const formattedMessages = messages.map(msg => ({
      fromUser: msg.senderId,
      toUser: msg.receiverId,
      message: msg.message,
      timestamp: msg.timeStamp
    }));

    res.json(formattedMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
})

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // must match frontend
    methods: ["GET", "POST"],
    credentials: true
  }
})

const onlineUsers = new Map();

// Function to get all users with their online status
const getAllUsersWithStatus = async () => {
  try {
    // Get all registered users from database
    const allUsers = await userModel.find({}, { name: 1, _id: 0 });
    const allUserNames = allUsers.map(user => user.name);
    
    // Get currently online users
    const onlineUserNames = Array.from(onlineUsers.values());
    
    // Create user list with status
    const usersWithStatus = allUserNames.map(username => ({
      username,
      isOnline: onlineUserNames.includes(username),
      lastSeen: onlineUserNames.includes(username) ? new Date() : null
    }));
    
    return usersWithStatus;
  } catch (error) {
    console.error('Error getting users with status:', error);
    return [];
  }
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("register-user", async (username) => {
    onlineUsers.set(socket.id, username);
    socket.username = username;

    // Get all users with their online status
    const usersWithStatus = await getAllUsersWithStatus();
    
    // Emit to all connected clients
    io.emit("update-users", usersWithStatus);
    
    console.log(`${username} came online. Total users:`, usersWithStatus.length);
  });

  socket.on("private-message", async ({ fromUser, toUser, message }) => {
    try {
      // Create timestamp when message is received
      const timestamp = new Date();
      
      const newMessage = new messageModel({
        senderId: fromUser,
        receiverId: toUser,
        message,
        timeStamp: timestamp
      });

      await newMessage.save();

      // Create message data in the format expected by frontend
      const messageData = {
        fromUser,
        toUser,
        message,
        timestamp: timestamp
      };

      // Send to all sockets that belong to either sender or receiver
      const allSockets = Array.from(io.sockets.sockets.values());

      allSockets.forEach(s => {
        if (s.username === fromUser || s.username === toUser) {
          s.emit("private-message", messageData);
        }
      });

      console.log(`Private message from ${fromUser} to ${toUser} at ${timestamp.toLocaleTimeString()}: ${message}`);
    } catch (error) {
      console.error('Error handling private message:', error);
      
      // Send error back to sender
      socket.emit("message-error", { 
        error: "Failed to send message",
        originalMessage: { fromUser, toUser, message }
      });
    }
  });

  socket.on("disconnect", async () => {
    const username = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    
    // Get updated users with status
    const usersWithStatus = await getAllUsersWithStatus();
    io.emit("update-users", usersWithStatus);
    
    if (username) {
      console.log(`${username} went offline. Remaining online:`, Array.from(onlineUsers.values()));
    }
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
})

app.use("/user", routes)

server.listen(3000, () => {
  toConnectDB()
  console.log("Server is running on http://localhost:3000")
})