import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
// Import your custom axios instance instead of regular axios
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';

export const chatContext = createContext(null);

// Connect socket outside the component
const socket = io("http://localhost:3000");

const Context = (props) => {
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [toggler, settoggler] = useState(true);
  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messageIds = useRef(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("chat-username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Load chat history - using axiosInstance instead of axios
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (senderId && receiverId) {
        try {
          // Using axiosInstance - cookies will be sent automatically
          const res = await axiosInstance.get(`/user/messages?senderId=${senderId}&receiverId=${receiverId}`);
          if (res.data && Array.isArray(res.data)) {
            messageIds.current.clear();
            
            const formattedMessages = res.data.map(msg => {
              const messageId = `${msg.senderId}-${msg.receiverId}-${msg.message}-${msg.timeStamp}`;
              messageIds.current.add(messageId);
              
              return {
                id: messageId,
                fromUser: msg.senderId,
                toUser: msg.receiverId,
                message: msg.message,
                timestamp: msg.timeStamp
              };
            });
            setMessages(formattedMessages);
          }
        } catch (err) {
          console.error("Error fetching chat history:", err);
        }
      }
    };

    fetchChatHistory();
  }, [senderId, receiverId]);

  useEffect(() => {
    if (username) {
      localStorage.setItem("chat-username", username);
      socket.emit("register-user", username);
    }

    const handlePrivateMessage = ({ fromUser, toUser: recipient, message, timestamp }) => {
      const messageId = `${fromUser}-${recipient}-${message}-${timestamp || Date.now()}`;
      
      if (!messageIds.current.has(messageId)) {
        messageIds.current.add(messageId);
        
        setMessages(prev => [...prev, { 
          id: messageId,
          fromUser, 
          toUser: recipient, 
          message, 
          timestamp: timestamp || Date.now() 
        }]);
      }
    };

    const handleUpdateUsers = (users) => {
      setRegisteredUsers(users.filter(user => user !== username));
    };

    socket.on("private-message", handlePrivateMessage);
    socket.on("update-users", handleUpdateUsers);

    return () => {
      socket.off("private-message", handlePrivateMessage);
      socket.off("update-users", handleUpdateUsers);
    };
  }, [username]);

  // Register function - using axiosInstance
  const handleRegister = async (formData) => {
    try {
      const res = await axiosInstance.post("/user/register", formData);
      if (res.status === 201) {
        // Don't set registration state immediately
        // Just return success - let the component handle navigation
        return true;
      }
    } catch (err) {
      console.error("Registration error:", err);
      return false;
    }
  };

  // Send message function - using axiosInstance
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      // Using axiosInstance - cookies will be sent automatically
      const res = await axiosInstance.post("/user/message", {
        senderId,
        receiverId,
        message
      });

      socket.emit("private-message", {
        fromUser: username,
        toUser,
        message
      });

      setMessage("");
    } catch (err) {
      console.error("Error sending message", err);
      alert("Failed to send message");
    }
  };

  // Login function - using axiosInstance
  const handleLogin = async (formData) => {
    try {
      const res = await axiosInstance.post("/user/login", formData);
      if (res.status === 200) {
        setUsername(res.data.user.name);
        return true;
      }
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // Logout function - using axiosInstance
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/user/logout");
      setUsername("");
      setIsRegistered(false);
      localStorage.removeItem("chat-username");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <chatContext.Provider value={{
      username, setUsername,
      isRegistered, setIsRegistered,
      toUser, setToUser,
      message, setMessage,
      messages, setMessages,
      registeredUsers,
      handleRegister, 
      handleSend,
      handleLogin,
      handleLogout,
      toggler, settoggler,
      senderId, setSenderId,
      receiverId, setReceiverId,
      socket,
      messagesEndRef
    }}>
      {props.children}
    </chatContext.Provider>
  );
};

export default Context;