import express from 'express'
const searchRouter=express.Router()

import searchPosts from "../controllers/search.controller.js";

searchRouter.get("/",searchPosts)

export default searchRouter