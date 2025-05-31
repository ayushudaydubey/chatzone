import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axiosInstance, { fileUploadInstance } from '../utils/axios';

export const chatContext = createContext(null);

const socket = io("http://localhost:3000");

const Context = (props) => {
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [users, setUsers] = useState([]);
  const [toUser, setToUser] = useState("");
  const [isLoading, setIsLoading] = useState('');
  const [unreadMessages, setUnreadMessages] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  // AI Bot related state
  const [isAiTyping, setIsAiTyping] = useState(false);
  const AI_BOT_NAME = "AI Friend";
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Fetch current user from backend using cookie
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get("/user/auth/me");
        if (response.data && response.data.name) {
          setUsername(response.data.name);
          setIsRegistered(true);
          socket.emit("register-user", response.data.name);
          await loadAllUsers();
          // Add AI Friend to users list if not present
          setUsers(prev => {
            const hasAiBot = prev.some(user =>
              (typeof user === 'object' ? user.username : user) === AI_BOT_NAME
            );
            if (!hasAiBot) {
              return [
                { username: AI_BOT_NAME, isOnline: true, isAiBot: true },
                ...prev
              ];
            }
            return prev;
          });
        } else {
          setUsername("");
          setIsRegistered(false);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        setUsername("");
        setIsRegistered(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Function to load all registered users
  const loadAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/user/all-users');
      if (response.data) {
        const allUsersWithStatus = response.data
          .filter(userName => userName !== username && userName.trim() !== '')
          .map(userName => ({
            username: userName,
            isOnline: false,
            lastSeen: null
          }));
        // Add AI Friend at the top of the list
        const usersWithAI = [
          { username: AI_BOT_NAME, isOnline: true, isAiBot: true },
          ...allUsersWithStatus
        ];
        setUsers(usersWithAI);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Function to mark messages as read for a specific user
  const markMessagesAsRead = (fromUser) => {
    setUnreadMessages(prev => {
      const updated = { ...prev };
      delete updated[fromUser];
      return updated;
    });
  };

  // Function to get unread count for a user
  const getUnreadCount = (fromUser) => {
    return unreadMessages[fromUser] || 0;
  };

  // Function to get last message for a user
  const getLastMessage = (fromUser) => {
    return lastMessages[fromUser] || null;
  };

  // Helper function to get online users only
  const getOnlineUsers = () => {
    return users.filter(user => {
      const userObj = typeof user === 'object' ? user : { username: user, isOnline: true };
      return userObj.isOnline;
    });
  };

  // Helper function to get total unread messages count
  const getTotalUnreadCount = () => {
    return Object.values(unreadMessages).reduce((total, count) => total + count, 0);
  };

  // Socket event listeners
  useEffect(() => {
    socket.on("private-message", (messageData) => {
      setMessages(prev => {
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

      if (messageData.fromUser !== username && messageData.toUser === username && messageData.fromUser !== toUser) {
        setUnreadMessages(prev => ({
          ...prev,
          [messageData.fromUser]: (prev[messageData.fromUser] || 0) + 1
        }));
        setLastMessages(prev => ({
          ...prev,
          [messageData.fromUser]: {
            message: messageData.message,
            timestamp: messageData.timestamp,
            isFile: messageData.isFile || messageData.messageType === 'file'
          }
        }));
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${messageData.fromUser}`, {
            body: messageData.isFile || messageData.messageType === 'file' ? '📎 Sent a file' : messageData.message,
            icon: '/favicon.ico'
          });
        }
      }
      if (messageData.fromUser !== username && messageData.toUser === username) {
        setLastMessages(prev => ({
          ...prev,
          [messageData.fromUser]: {
            message: messageData.message,
            timestamp: messageData.timestamp,
            isFile: messageData.isFile || messageData.messageType === 'file'
          }
        }));
      }
      if (messageData.fromUser === username && messageData.toUser !== username) {
        setLastMessages(prev => ({
          ...prev,
          [messageData.toUser]: {
            message: messageData.message,
            timestamp: messageData.timestamp,
            isFile: messageData.isFile || messageData.messageType === 'file'
          }
        }));
      }
    });

    socket.on("update-users", (usersWithStatus) => {
      if (Array.isArray(usersWithStatus)) {
        const filteredUsers = usersWithStatus
          .filter(user => {
            const userName = typeof user === 'object' ? user.username : user;
            return userName !== username && userName && userName.trim() !== '';
          })
          .map(user => {
            if (typeof user === 'object') {
              return {
                ...user,
                isOnline: user.isOnline !== undefined ? user.isOnline : true
              };
            } else {
              return {
                username: user,
                isOnline: true,
                lastSeen: new Date()
              };
            }
          });
        // Add AI Friend to the filtered users list
        const usersWithAI = [
          { username: AI_BOT_NAME, isOnline: true, isAiBot: true },
          ...filteredUsers
        ];
        setUsers(usersWithAI);
      }
    });

    socket.on("user-disconnected", (disconnectedUser) => {
      setUsers(prev => prev.map(user => {
        const userName = typeof user === 'object' ? user.username : user;
        if (userName === disconnectedUser) {
          return typeof user === 'object' ?
            { ...user, isOnline: false, lastSeen: new Date() } :
            { username: user, isOnline: false, lastSeen: new Date() };
        }
        return user;
      }));
    });

    socket.on("user-connected", (connectedUser) => {
      setUsers(prev => {
        const existingUserIndex = prev.findIndex(user => {
          const userName = typeof user === 'object' ? user.username : user;
          return userName === connectedUser;
        });
        if (existingUserIndex !== -1) {
          const updatedUsers = [...prev];
          updatedUsers[existingUserIndex] = typeof prev[existingUserIndex] === 'object' ?
            { ...prev[existingUserIndex], isOnline: true, lastSeen: new Date() } :
            { username: prev[existingUserIndex], isOnline: true, lastSeen: new Date() };
          return updatedUsers;
        } else {
          if (connectedUser !== username) {
            return [...prev, { username: connectedUser, isOnline: true, lastSeen: new Date() }];
          }
        }
        return prev;
      });
    });

    return () => {
      socket.off("private-message");
      socket.off("update-users");
      socket.off("user-disconnected");
      socket.off("user-connected");
    };
  }, [username, toUser]);

  useEffect(() => {
    if (toUser) {
      setTimeout(() => {
        markMessagesAsRead(toUser);
      }, 100);
    }
  }, [toUser, messages]);

  // UPDATED: Load chat history function to handle AI messages
  const loadChatHistory = async () => {
    if (!username || !toUser) return;
    try {
      if (toUser === AI_BOT_NAME) {
        // For AI Friend, filter local messages
        const aiMessages = messages.filter(msg =>
          (msg.fromUser === username && msg.toUser === AI_BOT_NAME) ||
          (msg.fromUser === AI_BOT_NAME && msg.toUser === username)
        );
        setMessages(aiMessages);
      } else {
        // For real users, load from server
        const response = await axiosInstance.get(`/user/messages?senderId=${username}&receiverId=${toUser}`);
        if (response.data) {
          setMessages(response.data);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  useEffect(() => {
    if (username && toUser) {
      loadChatHistory();
    }
  }, [username, toUser]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // NEW: Function to send message to AI
  const sendToAI = async (userMessage) => {
    if (!userMessage.trim()) return;
    try {
      setIsAiTyping(true);
      // Get recent chat history with AI for context
      const aiChatHistory = messages.filter(msg =>
        (msg.fromUser === username && msg.toUser === AI_BOT_NAME) ||
        (msg.fromUser === AI_BOT_NAME && msg.toUser === username)
      );
      const response = await axiosInstance.post('/user/askSomething', {
        message: userMessage,
        chatHistory: aiChatHistory
      });
      if (response.data.success) {
        const aiMessage = {
          fromUser: AI_BOT_NAME,
          toUser: username,
          message: response.data.response,
          timestamp: new Date().toISOString(),
          isAiBot: true
        };
        setMessages(prev => [...prev, aiMessage]);
        setLastMessages(prev => ({
          ...prev,
          [AI_BOT_NAME]: {
            message: response.data.response,
            timestamp: aiMessage.timestamp,
            isFile: false
          }
        }));
      } else {
        throw new Error(response.data.error || 'AI response failed');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        fromUser: AI_BOT_NAME,
        toUser: username,
        message: "Sorry, I'm having trouble responding right now. Please try again! 😅",
        timestamp: new Date().toISOString(),
        isAiBot: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // UPDATED: Handle send function to detect AI messages
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !toUser) return;
    const messageData = {
      fromUser: username,
      toUser: toUser,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    try {
      setMessages(prev => [...prev, messageData]);
      if (toUser === AI_BOT_NAME) {
        await sendToAI(message.trim());
      } else {
        socket.emit("private-message", messageData);
      }
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // ...existing file upload, register, login, logout, validateSession functions...

  const handleFileUpload = async (file, onProgress) => {
    if (!toUser) {
      throw new Error('No recipient selected');
    }
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size must be less than 50MB');
    }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      throw new Error('Only image and video files are allowed');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', username);
    formData.append('receiverId', toUser);
    try {
      const response = await fileUploadInstance.post('/user/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
        timeout: 300000,
      });
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Upload failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
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
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/user/register', userData);
      if (response.status === 201 && response.data.user) {
        setUsername(response.data.user.name);
        setIsRegistered(true);
        return {
          success: true,
          user: response.data.user
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/user/login', credentials);
      if (response.status === 200 && response.data.user) {
        setUsername(response.data.user.name);
        setIsRegistered(true);
        return {
          success: true,
          user: response.data.user
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.post('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUsername('');
      setIsRegistered(false);
      setIsLoading(false);
    }
  };

  const validateSession = async () => {
    try {
      const response = await axiosInstance.get('/user/me');
      if (response.status === 200 && response.data) {
        setUsername(response.data.name);
        setIsRegistered(true);
        return { success: true, user: response.data };
      } else {
        setUsername('');
        setIsRegistered(false);
        return { success: false, error: 'Session invalid' };
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      setUsername('');
      setIsRegistered(false);
      return {
        success: false,
        error: error.response?.data?.error || 'Session expired'
      };
    }
  };

  const contextValue = {
    username,
    setUsername,
    isRegistered,
    setIsRegistered,
    validateSession,
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
    handleFileUpload,
    logout,
    socket,
    messagesEndRef,
    loadChatHistory,
    loadAllUsers,
    getOnlineUsers,
    unreadMessages,
    lastMessages,
    markMessagesAsRead,
    getUnreadCount,
    getLastMessage,
    getTotalUnreadCount,
    // AI Bot related values
    AI_BOT_NAME,
    isAiTyping,
    sendToAI
  };

  return (
    <chatContext.Provider value={contextValue}>
      {props.children}
    </chatContext.Provider>
  );
};

export default Context;