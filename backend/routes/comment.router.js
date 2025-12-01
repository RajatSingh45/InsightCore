import userAuth from "../middlewares/userAuth.middleware.js"
import express from 'express'
import { addComment, deleteComment, deleteCommentsByPost, getCommentsByPost, getThrededComments, hardDeleteComment, likeOnComment, replyToComment, updateComment } from "../controllers/comment.controller.js"

const commentRouter=express.Router()

commentRouter.post("/:postId",userAuth(["user","admin","moderator"]),addComment)
commentRouter.post("/reply/:commentId",userAuth(["user","admin","moderator"]),replyToComment)
commentRouter.patch("/update/:commentId",userAuth(["user","admin","moderator"]),updateComment)
commentRouter.delete("/remove/:commentId",userAuth(["user","admin","moderator"]),deleteComment)
commentRouter.get("/get-comments/:postId",getCommentsByPost)
commentRouter.get("/get-replies/:commentId",getThrededComments)
commentRouter.delete("/remove-by-post/:postId",userAuth(["admin","moderator"]),deleteCommentsByPost)
commentRouter.post("/like/:commentId",userAuth(["user","admin","moderator"]),likeOnComment)
commentRouter.delete("/hard-delete",userAuth(["admin"]),hardDeleteComment)

export default commentRouter