import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDB } from './configs/db.js'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.router.js'
import adminRouter from './routes/admin.router.js'
import postRouter from './routes/post.router.js'
import commentRouter from './routes/comment.router.js'
import voteRouter from './routes/vote.router.js'
import uploadRouter from './routes/upload.router.js'

const app=express()

dotenv.config()

connectDB()

app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send("Insight core is running")
})

app.use("/users",userRouter)

app.use("/admin",adminRouter)

app.use("/posts",postRouter)

app.use("/comments",commentRouter)

app.use("/vote",voteRouter)

app.use("/uploads",uploadRouter)

export default app



