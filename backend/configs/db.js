import dotenv from 'dotenv'
dotenv.config()

import mongoose from "mongoose";

export const connectDB=async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected succesfully!",mongoose.connection.name)
    } catch (error) {
        console.error("MongoDB connection failed:",error)
    }
}