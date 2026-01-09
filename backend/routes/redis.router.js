import express from 'express'
import testRedis from '../controllers/testRedis.controller.js'

const redisRouter=express.Router()

redisRouter.get("/redis-test",testRedis)

export default redisRouter