import dotenv from 'dotenv'
dotenv.config()

import { Worker } from "bullmq";
import redis from "../configs/redis.js";
import postModel from "../models/post.model.js";
import { connectDB } from "../configs/db.js";
import mongoose from "mongoose";

const startWorker = async () => {
  try {
    mongoose.set("bufferCommands", false);

    console.log("MONGODB_URI:",process.env.MONGODB_URI);

    await connectDB();
    console.log("MOngDB ready, Starting worker...");

    const worker = new Worker(
      "post-processing",
      async (job) => {
        const { postId } = job.data;

        console.log("Processing post:", postId);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        await postModel.findByIdAndUpdate(postId, {
          processed: true,
        });

        console.log("Post processed:", postId);
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