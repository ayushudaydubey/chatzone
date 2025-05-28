import express from 'express'
import { loginUserController, registerUserController, verifyTokenMiddleware } from '../Controllers/user.controller.js'
import { getMessagesController, messageController } from '../Controllers/message.controller.js'
const routes = express.Router()

routes.post("/register", registerUserController)

routes.post("/login", loginUserController)
routes.post("/chat", verifyTokenMiddleware, messageController);
routes.post("/logout",loginUserController)

routes.get("/chat/:senderId/:receiverId", getMessagesController)
routes.get("/auth/check", verifyTokenMiddleware, (req, res) => {
  try {
    // If middleware passes, user is authenticated
    res.status(200).json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name || req.user.username 
      }
    });
  } catch (error) {
    res.status(401).json({
      authenticated: false,
      error: "Authentication failed"
    });
  }
})

// Route to get all users (protected)
routes.get("/all-users", verifyTokenMiddleware, async (req, res) => {
  try {
  
    const users = ["user1", "user2", "user3"]; // Replace with actual user fetching logic
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
})

routes.get("/messages", verifyTokenMiddleware, getMessagesController)





export default routes