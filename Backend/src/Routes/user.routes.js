import express from 'express'
import { loginUserController, registerUserController, verifyTokenMiddleware } from '../Controllers/user.controller.js'
import { getMessagesController, messageController } from '../Controllers/message.controller.js'
const routes = express.Router()

routes.post("/register",registerUserController)

routes.post("/login",loginUserController)
routes.post("/chat", verifyTokenMiddleware, messageController);


routes.get("/chat/:senderId/:receiverId", getMessagesController)



export default routes