import express from 'express'
import voteOnPost from '../controllers/vote.controller.js'
import userAuth from '../middlewares/userAuth.middleware.js'

const voteRouter=express.Router()

voteRouter.post("/:id",userAuth(["user","admin","moderator"]),voteOnPost)


export default voteRouter