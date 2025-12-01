import Redis from 'ioredis'

export const redis=new Redis({
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    username:process.env.REDIS_USERNAME,
    password:process.env.REDIS_PASSWORD,
    tls:{}
})

redis.on("connect",()=>{console.log("Redis connected")})
redis.on("error",(error)=>{console.log("Redis error:",error)})