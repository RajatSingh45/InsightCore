// import redis from '../configs/redis.js'

// const testRedis = async (req, res) => {
//   console.log("🔥 Testing Redis route hit at:", new Date().toLocaleTimeString());
  
//   // Set response timeout
//   const timeout = setTimeout(() => {
//     if (!res.headersSent) {
//       console.log("⏰ Request timeout - Redis not responding");
//       res.status(500).json({
//         success: false,
//         message: "Redis timeout - Connection issue",
//         tip: "Check if Redis Cloud instance is active"
//       });
//     }
//   }, 8000);

//   try {
//     console.log("1. Testing connection with ping...");
    
//     // Test with ping first (simpler command)
//     const pingResult = await redis.ping().catch(err => {
//       throw new Error(`Ping failed: ${err.message}`);
//     });
//     console.log("✅ Ping result:", pingResult);
    
//     console.log("2. Setting test key...");
//     const setResult = await redis.set(
//       "test-key", 
//       `Hello Redis! ${new Date().toLocaleTimeString()}`,
//       "EX", // Expire in
//       30 // 30 seconds
//     ).catch(err => {
//       throw new Error(`Set failed: ${err.message}`);
//     });
//     console.log("✅ Set result:", setResult);
    
//     console.log("3. Getting test key...");
//     const value = await redis.get("test-key").catch(err => {
//       throw new Error(`Get failed: ${err.message}`);
//     });
//     console.log("✅ Get result:", value);
    
//     clearTimeout(timeout);
    
//     res.status(200).json({
//       success: true,
//       message: "Redis is working perfectly!",
//       data: value,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     clearTimeout(timeout);
//     console.log("❌ Redis test failed:", error.message);
    
//     // Check Redis status
//     console.log("Redis connection status:", redis.status);
    
//     res.status(500).json({
//       success: false,
//       message: error.message,
//       status: redis.status,
//       tip: "Try: 1. Check Redis Cloud dashboard 2. Whitelist your IP 3. Restart Redis instance"
//     });
//   }
// };

// export default testRedis;