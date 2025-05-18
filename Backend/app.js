import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'

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

app.get("/", (req, res) => {
  res.send("Home")
})

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

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000")
})
