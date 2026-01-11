import dotenv from 'dotenv'
dotenv.config()
import Redis from 'ioredis'

const redis=new Redis({
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    retryStrategy(times){
        return Math.min(times*50,2000);
    },
    maxRetriesPerRequest: null
});

redis.on('connect',()=>{
    console.log("Redis Conected");
})

redis.on('error',(error)=>{
    console.log("Redis error:",error.message)
})

export default redis