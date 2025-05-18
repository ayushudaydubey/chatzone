import React, { createContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'

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

    const handleUpdateUsers = (users) => {
      // Remove this user from the list if present
      setRegisteredUsers(users.filter(user => user !== username))
    }

    socket.on("private-message", handlePrivateMessage)
    socket.on("update-users", handleUpdateUsers)

    return () => {
      socket.off("private-message", handlePrivateMessage)
      socket.off("update-users", handleUpdateUsers)
    }
  }, [username]) // <-- important: re-run when username changes

  const handleRegister = (e) => {
    e.preventDefault()
    if (username.trim()) {
      socket.emit("register-user", username)
      settoggler(!toggler)
      setIsRegistered(true)
      console.log("Registered user:", username)
    }
  }

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
