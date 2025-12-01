import mongoose from 'mongoose'

const voteSchema=new mongoose.Schema({
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    value:{
        type:Number,
        enum:[-1,1],
        rewuired:true
    }
},{timestamps:true})

voteSchema.index({ user: 1, post: 1 }, { unique: true })

export default mongoose.model("Vote",voteSchema)