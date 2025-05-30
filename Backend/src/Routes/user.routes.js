import express from 'express';
import { 
  loginUserController, 
  registerUserController, 
  logoutUserController,
  verifyTokenMiddleware,
  getAllUsersController,
  getMeController
} from '../Controllers/user.controller.js';
import { getMessagesController, messageController } from '../Controllers/message.controller.js';

const routes = express.Router();

// Auth routes
routes.post("/register", registerUserController);
routes.post("/login", loginUserController);
routes.post("/logout", verifyTokenMiddleware, logoutUserController);

// Protected routes
routes.post("/chat", verifyTokenMiddleware, messageController);
routes.get("/chat/:senderId/:receiverId", verifyTokenMiddleware, getMessagesController);

// Route to check authentication status and get current user
routes.get("/auth/me",verifyTokenMiddleware,getMeController)

// Route to get all users (protected) - now uses the controller
routes.get("/all-users", verifyTokenMiddleware, getAllUsersController);

// Route to get messages between users (protected)
routes.get("/messages", verifyTokenMiddleware, getMessagesController);

export default routes;