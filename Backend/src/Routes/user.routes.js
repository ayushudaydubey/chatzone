import express from 'express'
import { registerUserController } from '../Controllers/user.controller.js'
const routes = express.Router()

routes.post("/register",registerUserController)




export default routes