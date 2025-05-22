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

const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Home")
})

const onlineUsers = new Map(); // socketId -> username

// New endpoint to get chat history between two users
app.get("/user/messages", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "senderId and receiverId are required" });
    }
    
    // Find messages where either:
    // 1. senderId is sender and receiverId is receiver, OR
    // 2. senderId is receiver and receiverId is sender
    const messages = await messageModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timeStamp: 1 }); // Sort by timestamp ascending
    
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

let registeredUsers = []

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)
  
  socket.on("register-user", (username) => {
    onlineUsers.set(socket.id, username);
    socket.username = username; // Store username on socket for easy access
    
    // Broadcast updated user list to everyone
    const users = Array.from(onlineUsers.values());
    io.emit("update-users", users);
  });
  
  socket.on("private-message", async ({ fromUser, toUser, message }) => {
    try {
      // Save to database
      const newMessage = new messageModel({
        senderId: fromUser,
        receiverId: toUser,
        message
      });
      
      await newMessage.save();
      
      // Create message object with timestamp
      const messageData = { 
        fromUser, 
        toUser, 
        message, 
        timestamp: newMessage.timeStamp || Date.now() 
      };
      
      // Find ALL sockets for both sender and receiver
      const allSockets = Array.from(io.sockets.sockets.values());
      
      // Emit to all sockets of the sender and receiver
      allSockets.forEach(s => {
        if (s.username === fromUser || s.username === toUser) {
          s.emit("private-message", messageData);
        }
      });
      
      console.log(`Private message from ${fromUser} to ${toUser}: ${message}`);
    } catch (error) {
      console.error('Error handling private message:', error);
    }
  })
  
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    const users = Array.from(onlineUsers.values());
    io.emit("update-users", users);
  });
})

app.use("/user", routes)

server.listen(3000, () => {
  toConnectDB()
  console.log("Server is running on http://localhost:3000")
})