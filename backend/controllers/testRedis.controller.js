import { redis } from "../configs/redis.js";

const testRedis = async () => {
  try {
    await redis.set("test-key", "Hello from redis!");

    const value = redis.get("test-key");

    res.json({
      success: true,
      message: "redis working successfully",
      redis_value: value,
    });
  } catch (error) {
    cosole.log("Error during testing redis:", error.message);
    res.json({
        success:false,
        message:"Redis Error"
    })
  }
};

export default testRedis
