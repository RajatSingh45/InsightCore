import mongoose from "mongoose"

const commentSchema=new mongoose.Schema({
    comment:{
        type:String,
        required:true,
        trim:true
    },
    commentedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,
        index:true
    },
    parentComment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        index:true,
        default:null
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    deletedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    score:{
      type:Number,
      default:0
    },
    like:{
        type:Number,
        default:0
    },
    dislike:{
        type:Number,
        default:0
    },
},{timestamps:true})

commentSchema.index({post:1,parentComment:1,createdAt:-1})

export default mongoose.model("Comment",commentSchema)