import mongoose from "mongoose";

const likeCommentSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        required:true
    },
    value:{
        type:Number,
        enum:[-1,1],
        required:true
    }
},{timestamps:true})

likeCommentSchema.index({user:1,comment:1},{unique:true})

export default mongoose.model("LikeComment",likeCommentSchema)