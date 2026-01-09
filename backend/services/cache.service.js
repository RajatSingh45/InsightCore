import redis from "../configs/redis.js";

// const CACHE_TTL = {
//   posts: 300,
//   comments: 180,
//   users: 600,
//   feed: 120,
// };

const getCache = async (key) => {
  try {
    const data = await redis.get(key);

    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log(`Cache error (get ${key}):`, error.message);
    return null;
  }
};

const setCache=async (key,data,ttl)=>{
    try {
        await redis.set(key, JSON.stringify(data), "EX", ttl);
    } catch (error) {
         console.log(`Cache error (set ${key}):`, error.message);
    }
}

const deleteCache=async (pattern)=>{
    try {
        const keys=await redis.keys(pattern)

        if(keys.length>0){
            await redis.del(...keys)
            console.log(`Cleared cache: ${pattern}`);
        }
    } catch (error) {
        console.log(`Cache clear error:`, error.message);

    }
}

export {getCache,setCache,deleteCache}