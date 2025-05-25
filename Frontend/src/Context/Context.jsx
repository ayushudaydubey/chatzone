import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axiosInstance, { fileUploadInstance } from '../utils/axios';

export const chatContext = createContext(null);

const socket = io("http://localhost:3000");

const Context = (props) => {
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false)
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [users, setUsers] = useState([]);
  const [toUser, setToUser] = useState("");

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
      socket.emit("register-user", savedUsername);
    }
    
    loadAllUsers();
  }, []);

  // Function to load all registered users
  const loadAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/user/all-users');
      if (response.data) {
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
        const filteredUsers = usersWithStatus
          .filter(user => {
            const userName = typeof user === 'object' ? user.username : user;
            return userName !== username;
          })
          .map(user => {
            if (typeof user === 'object') {
              return user;
            } else {
              return {
                username: user,
                isOnline: true,
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

  // Updated function to handle file upload with progress tracking
  const handleFileUpload = async (file, onProgress) => {
    if (!toUser) {
      throw new Error('No recipient selected');
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size must be less than 50MB');
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      throw new Error('Only image and video files are allowed');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', username);
    formData.append('receiverId', toUser);

    try {
      console.log('Starting file upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await fileUploadInstance.post('/user/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
        // Override timeout for this specific request if needed
        timeout: 300000, // 5 minutes for very large files
      });

      if (response.data.success) {
        console.log('File uploaded successfully:', response.data.fileUrl);
        return response.data;
      } else {
        throw new Error('Upload failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('File upload error:', error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout: The file upload took too long. Please try with a smaller file.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large: The file exceeds the maximum allowed size.');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Failed to upload file: ' + error.message);
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post("/user/register", userData);
      if (response.status === 200 || response.status === 201) {
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
        
        socket.emit("register-user", userName);
        setIsRegistered(true);
        
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
      socket.emit("private-message", messageData);
      setMessage("");
      console.log("Message sent:", messageData);
    } catch (error) {
      console.error("Send message error:", error);
      alert("Failed to send message");
    }
  };

  const logout = () => {
    socket.disconnect();
    
    setUsername("");
    setMessages([]);
    setUsers([]);
    setToUser("");
    setIsRegistered(false);
    
    localStorage.removeItem("username");
    
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
    users,
    toUser,
    setToUser,
    register,
    login,
    handleSend,
    handleFileUpload, // Updated function with progress tracking
    logout,
    socket,
    messagesEndRef,
    loadChatHistory,
    loadAllUsers
  };

  return (
    <chatContext.Provider value={contextValue}>
      {props.children}
    </chatContext.Provider>
  );
};

export default Context;