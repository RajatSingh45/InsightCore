import {Queue} from 'bullmq'
import redis from '../configs/redis.js';

const postQueue=new Queue("post-processing",{
    connection:redis
});

export default postQueue