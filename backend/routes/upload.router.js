import express from 'express'
import { upload } from '../middlewares/upload.middleware.js'
import userAuth from '../middlewares/userAuth.middleware.js'
import uploadFile from '../controllers/upload.controller.js'

const uploadRouter=express.Router()

uploadRouter.post("/",userAuth(["user","admin","moderator"]),upload("image"),uploadFile)

export default uploadRouter