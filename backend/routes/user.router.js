import express from 'express'
import {body} from 'express-validator'
import { login, logout, profile, register } from '../controllers/user.controller.js'
import userAuth from '../middlewares/userAuth.middleware.js'


const userRouter=express.Router()

userRouter.post('/register',[
    body('email').isEmail().withMessage("Invalid email"),
    body('password').isLength({min:6}).withMessage("Minnimum password length should be six"),
    body('name').isLength({min:3}).withMessage("Minnimum name lenght should be three")
],register)

userRouter.post('/login',[
    body('email').isEmail().withMessage("Invalid email"),
    body('password').isLength({min:6}).withMessage("Minnimum password length should be six")
],login)

userRouter.post('/logout',userAuth(),logout)

userRouter.get('/profile',userAuth(["user","admin","moderator"]),profile)

export default userRouter