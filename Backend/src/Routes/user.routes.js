import express from 'express';

import { 
  loginUserController, 
  registerUserController, 
  logoutUserController,
  verifyTokenMiddleware,
  getAllUsersController,
  getMeController
} from '../Controllers/user.controller.js';
import { aiMessageSaveController,
  getMessagesController, messageController,

   } from '../Controllers/message.controller.js';
import { aiChatController } from '../Services/ai.service.js';

// import { aiChatController } from '../Services/ai.service.js';

const routes = express.Router();


// Auth routes
routes.post("/register", registerUserController);
routes.post("/login", loginUserController);
routes.post("/logout", verifyTokenMiddleware, logoutUserController);

// Protected routes
routes.post("/chat", verifyTokenMiddleware, messageController);

// For AI chat functionality
routes.post("/askSomething", verifyTokenMiddleware, aiChatController)

// Optional: If you want to save AI messages separately
routes.post("/save-ai-message", verifyTokenMiddleware, aiMessageSaveController)

routes.get("/chat/:senderId/:receiverId", verifyTokenMiddleware, getMessagesController);

// Route to check authentication status and get current user
routes.get("/auth/me",verifyTokenMiddleware,getMeController)

// Route to get all users (protected) - now uses the controller
routes.get("/all-users", verifyTokenMiddleware, getAllUsersController);

// Route to get messages between users (protected)
routes.get("/messages", verifyTokenMiddleware, getMessagesController);

// routes.get("/unread-messages", verifyTokenMiddleware, unreadMessageController);
// routes.get("/all-recent-messages",verifyTokenMiddleware,getAllRecentMessage)





export default routes;