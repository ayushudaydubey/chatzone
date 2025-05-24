 import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '../utils/axios';

export const chatContext = createContext(null);

const socket = io("http://localhost:3000");

const Context = (props) => {
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false)
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [users, setUsers] = useState([]); // Will now contain all users with status
  const [toUser, setToUser] = useState("");

  // Add messagesEndRef for auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize username from localStorage and load all users
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
      // Register user with socket when component mounts
      socket.emit("register-user", savedUsername);
    }
    
    // Load all registered users when component mounts
    loadAllUsers();
  }, []);

  // Function to load all registered users
  const loadAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/user/all-users');
      if (response.data) {
        // Convert to user objects with default offline status
        const allUsersWithStatus = response.data.map(username => ({
          username,
          isOnline: false,
          lastSeen: null
        }));
        setUsers(allUsersWithStatus);
      }
    } catch (error) {
      console.error("Error loading all users:", error);
    }
  };

  // Socket event listeners
  useEffect(() => {
    // Listen for private messages
    socket.on("private-message", (messageData) => {
      console.log("Received private message:", messageData);
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => 
          msg.fromUser === messageData.fromUser && 
          msg.toUser === messageData.toUser && 
          msg.message === messageData.message &&
          Math.abs(new Date(msg.timestamp) - new Date(messageData.timestamp)) < 1000
        );
        
        if (!exists) {
          return [...prev, messageData];
        }
        return prev;
      });
    });

    // Listen for user list updates with online status
    socket.on("update-users", (usersWithStatus) => {
      console.log("Updated user list with status:", usersWithStatus);
      
      if (Array.isArray(usersWithStatus)) {
        // Filter out current user and update the users list
        const filteredUsers = usersWithStatus
          .filter(user => {
            const userName = typeof user === 'object' ? user.username : user;
            return userName !== username;
          })
          .map(user => {
            if (typeof user === 'object') {
              return user; // Already has status info
            } else {
              // Convert string to object with status
              return {
                username: user,
                isOnline: true, // If we receive it in update, assume online
                lastSeen: new Date()
              };
            }
          });
        
        setUsers(filteredUsers);
      }
    });

    // Cleanup listeners
    return () => {
      socket.off("private-message");
      socket.off("update-users");
    };
  }, [username]);

  // Load chat history when toUser changes
  useEffect(() => {
    if (username && toUser) {
      loadChatHistory();
    }
  }, [username, toUser]);

  // Function to load chat history from server
  const loadChatHistory = async () => {
    try {
      const response = await axiosInstance.get(`/user/messages?senderId=${username}&receiverId=${toUser}`);
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post("/user/register", userData);
      if (response.status === 200 || response.status === 201) {
        // Reload all users after successful registration
        await loadAllUsers();
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error) {
      let errorMessage = "Registration failed";
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  };

  const login = async (userData) => {
    try {
      const response = await axiosInstance.post("/user/login", userData);
      if (response.status === 200 && response.data.user) {
        const userName = response.data.user.name;
        setUsername(userName);
        localStorage.setItem("username", userName);
        
        // Register user with socket after successful login
        socket.emit("register-user", userName);
        setIsRegistered(true);
        
        // Reload all users to get updated status
        await loadAllUsers();
        
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (error) {
      let errorMessage = "Login failed";
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  };

  // Updated handleSend function to use private-message event
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !toUser) return;

    const messageData = {
      fromUser: username,
      toUser: toUser,
      message: message.trim()
    };

    try {
      // Send via socket (works for both online and offline users)
      socket.emit("private-message", messageData);
      
      // Clear the message input
      setMessage("");
      
      console.log("Message sent:", messageData);
    } catch (error) {
      console.error("Send message error:", error);
      alert("Failed to send message");
    }
  };

  const logout = () => {
    // Disconnect from socket
    socket.disconnect();
    
    // Clear all state
    setUsername("");
    setMessages([]);
    setUsers([]);
    setToUser("");
    setIsRegistered(false);
    
    // Clear localStorage
    localStorage.removeItem("username");
    
    // Reconnect socket for next user
    socket.connect();
  };

  const contextValue = {
    username,
    setUsername,
    isRegistered,
    setIsRegistered,
    senderId,
    setSenderId,
    receiverId,
    setReceiverId,
    message,
    setMessage,
    messages,
    setMessages,
    users, // Now contains all users with online status
    toUser,
    setToUser,
    register,
    login,
    handleSend,
    logout,
    socket,
    messagesEndRef,
    loadChatHistory,
    loadAllUsers // Export this for manual refresh
  };

  return (
    <chatContext.Provider value={contextValue}>
      {props.children}
    </chatContext.Provider>
  );
};

export default Context;