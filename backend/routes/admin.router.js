import express from 'express'
import userAuth from '../middlewares/userAuth.middleware.js'
import { updateUserRole, users } from '../controllers/user.controller.js'



const adminRouter=express.Router()

adminRouter.get("/users",userAuth(["admin"]),users)

adminRouter.patch("/users/:id/role",userAuth(["admin"]),updateUserRole)

export default adminRouter