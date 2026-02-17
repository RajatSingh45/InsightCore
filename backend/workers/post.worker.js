import dotenv from 'dotenv'
dotenv.config()
import { Worker } from "bullmq";
import redis from "../configs/redis.js";
import postModel from "../models/post.model.js";
import { connectDB } from "../configs/db.js";
import mongoose from "mongoose";
import { generateSummary, generateTags } from '../services/ai.services.js';

const startWorker = async () => {
  try {
    mongoose.set("bufferCommands", false);

    console.log("MONGODB_URI:",process.env.MONGODB_URI);

    await connectDB();
    console.log("MOngDB ready, Starting worker...");

    const worker = new Worker(
      "post-processing",
      async (job) => {
        try{
        const { postId } = job.data;

        console.log("Processing post:", postId);

        const post=await postModel.findById(postId);
        
        const summary=await generateSummary(post.content);
        const tags=await generateTags(post.content);

        await postModel.findByIdAndUpdate(postId,{
          summary,
          tags,
          processed:true
        })

        console.log("Post processed:", postId);
      }catch(err){
         throw err;
      }
      },
      {
        connection: redis,
      }
    );

    worker.on("completed", (job) => {
      console.log(`Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
      console.log(`Job ${job.id} failed`, err);
    });
  } catch (error) {
    console.error("Worker startup failed:", error);
    process.exit(1);
  }
};

startWorker()