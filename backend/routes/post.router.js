import express from 'express'
import userAuth from '../middlewares/userAuth.middleware.js'
import { createPost, deletePost, getAllPost, getPostById, hardDeletePost, updatePost } from '../controllers/post.controller.js'

const postRouter=express.Router()

postRouter.post("/create",userAuth(["user","admin","moderator"]),createPost)

postRouter.get("/",getAllPost)

postRouter.get("/:postId",getPostById)

postRouter.patch("/update/:postId",userAuth(["user","admin"]),updatePost)

postRouter.delete("/delete/:postId",userAuth(["user","admin"]),deletePost)

postRouter.delete("hard-delete/:postId",userAuth(["admin"]),hardDeletePost)

export default postRouter