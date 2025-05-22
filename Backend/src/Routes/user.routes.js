import express from 'express'
import { loginUserController, registerUserController } from '../Controllers/user.controller.js'
import { getMessagesController, messageController } from '../Controllers/message.controller.js'
const routes = express.Router()

routes.post("/register",registerUserController)

routes.post("/login",loginUserController)

routes.post("/message",messageController)

routes.get("/messages/:senderId/:receiverId", getMessagesController)



export default routes