import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'

import dotenv from 'dotenv'
dotenv.config()

import { toConnectDB } from './src/db/db.js'
import cookieParser from 'cookie-parser'
import routes from './src/Routes/user.routes.js'

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

// Declare registeredUsers array here globally
let registeredUsers = []

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("register-user", (username) => {
    socket.username = username
    if (!registeredUsers.includes(username)) {
      registeredUsers.push(username)
    }
    console.log(`New registered user: ${username}`)
    io.emit("update-users", registeredUsers)
  })

  socket.on("private-message", ({ fromUser, toUser, message }) => {
    for (const [id, sock] of io.of("/").sockets) {
      if (sock.username === toUser) {
        sock.emit("private-message", { fromUser, toUser, message })
        console.log(`Private message from ${fromUser} to ${toUser}: ${message}`)
        break
      }
    }
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.username}`)
    registeredUsers = registeredUsers.filter(user => user !== socket.username)
    io.emit("update-users", registeredUsers)
  })
})

app.use("/user", routes)

server.listen(3000, () => {
  toConnectDB()
  console.log("Server is running on http://localhost:3000")
})
