import React, { createContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'

export const chatContext = createContext(null)
const socket = io("http://localhost:3000")

const Context = (props) => {
  const [username, setUsername] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)
  const [toUser, setToUser] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [toggler, settoggler] = useState(true)

  useEffect(() => {
    const handlePrivateMessage = ({ fromUser, toUser: recipient, message }) => {
      setMessages(prev => [...prev, { fromUser, toUser: recipient, message }])
    }

    if (username) {
      socket.emit("register-user", username);
    }

    const handleUpdateUsers = (users) => {
      setRegisteredUsers(users.filter(user => user !== username))
    }

    socket.on("private-message", handlePrivateMessage)
    socket.on("update-users", handleUpdateUsers)

    return () => {
      socket.off("private-message", handlePrivateMessage)
      socket.off("update-users", handleUpdateUsers)
    }
  }, [username])

  const handleRegister = async (formData) => {
    try {
      const res = await axios.post("http://localhost:3000/user/register", formData);
      if (res.status === 201) {
        setIsRegistered(true);
        setUsername(formData.name);
        console.log("User registered:", res.data);
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed");
    }
  };

  const handleSend = (e) => {
    e.preventDefault()
    if (toUser && message.trim()) {
      socket.emit("private-message", { fromUser: username, toUser, message })
      setMessages(prev => [...prev, { fromUser: "You", toUser, message }])
      setMessage("")
    }
  }

  return (
    <chatContext.Provider value={{
      username, setUsername,
      isRegistered, setIsRegistered,
      toUser, setToUser,
      message, setMessage,
      messages, setMessages,
      registeredUsers,
      handleRegister, handleSend,
      toggler, settoggler
    }}>
      {props.children}
    </chatContext.Provider>
  )
}

export default Context
