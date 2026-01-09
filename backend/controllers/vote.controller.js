import postModel from "../models/post.model.js";
import voteModel from "../models/vote.model.js";
import mongoose from "mongoose";

const voteOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // const Vote=await voteModel.findOne({post:postId,user:userId})

    const { value } = req.body;

    if (![1, -1].includes(value)) {
      return res.status(400).json({ message: "Invalid vote value" });
    }

    const existingVote = await voteModel.findOne({
      user: userId,
      post: postId,
    });

    //checking the vote
    if (existingVote && existingVote.value == value) {
      await existingVote.deleteOne();
    } else if (existingVote) {
      existingVote.value = value;
      await existingVote.save();
    } else {
      await voteModel.create({ user: userId, post: postId, value });
    }

    // Calculate new total score
    const agg = await voteModel.aggregate([
      { $match: { post: new mongoose.Types.ObjectId(postId) } },
      { $group: { _id: null, total: { $sum: "$value" } } },
    ]);

    const newScore = agg[0]?.total || 0;

    await postModel.findByIdAndUpdate(
      postId,
      { score: newScore },
      { new: true }
    );

    await deleteCache("posts:allPosts:*");
    await deleteCache(`post:${postId}`);

    res
      .status(200)
      .json({
        success: true,
        message: "Successfully voted on post",
        existingVote,
      });
  } catch (error) {
    console.log("Error during voting on post:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default voteOnPost;
