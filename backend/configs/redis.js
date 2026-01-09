import dotenv from "dotenv";
dotenv.config();
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD, 
  connectTimeout: 10000,
  maxRetriesPerRequest: 1,
  enableReadyCheck: false, 
  retryStrategy: null,
  enableOfflineQueue: false,
});


redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("ready", () => {
  console.log("Redis ready for commands");
});

redis.on("error", (error) => {
  if (error.code === 'ECONNRESET') {
  } else {
    console.log("Redis error:", error.message);
  }
});

redis.on("end", () => {
  console.log("Redis connection closed");
});

export default redis;
