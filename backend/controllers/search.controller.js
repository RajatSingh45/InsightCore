import postModel from "../models/post.model.js";

const searchPosts=async (req,res)=>{
    try {
        const query=req.query.q;

        if(!query){
            return res.status(400).json({message:"Query required"})
        }

        const page=Math.max(1,parseInt((req.query.page||"1")));
        const limit=Math.min(20,parseInt((req.query.limit||"10")));
        const skip=(page-1)*limit;

        const results=await postModel.aggregate([
            {
                $search: {
                    index:"InsightCorePosts",
                    compound:{
                        should: [
                            {
                                text:{
                                    query:query,
                                    path:"title",
                                    score:{boost :{value:5}}
                                }
                            },
                            {
                                text:{
                                    query:query,
                                    path:"content",
                                    score:{boost:{value:2}}
                                }
                            },
                            {
                                text:{
                                    query:query,
                                    path:"tags",
                                    score:{boost:{value:3}}
                                }
                            }
                        ]
                    },
                    highlight:{
                        path:["title","content"]
                    }
                }
            },
            {
                $addFields:{
                    score:{$meta:"searchScore"}
                }
            },
            {
                $sort:{score:-1}
            },
            {$skip:skip},
            {$limit:limit},

            {
                $project:{
                    title:1,
                    summary:1,
                    tags:1,
                    score:1,
                    highlights:{$meta:"searchHighlights"}
                }
            }
        ]);

        res.json({
            success:true,
            page,
            limit,
            results
        })
    } catch (error) {
        console.log("Search error:",error.message);
        res.status(500).json({message:"Search error"})
    }
};

export default searchPosts