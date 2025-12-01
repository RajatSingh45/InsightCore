import commentModel from "../models/comment.model.js";
import postModel from "../models/post.model.js";
import mongoose from "mongoose";
import voteModel from "../models/vote.model.js";
import likeCommentModel from "../models/likeCommentModel.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Provide all details to post" });
    }

    const post = await postModel.create({
      title,
      content,
      author: req.user._id,
    });

    if (!post)
      return res
        .status(500)
        .json({ success: false, message: "New post is not created" });

    const newPost = await post.populate("author", "name email");

    res
      .status(201)
      .json({ success: true, message: "New post created succefully", newPost });
  } catch (error) {
    console.log("Error during creating the post:", error.message);
    return res.status(500).josn({ success: false, message: "Server error" });
  }
};

const getAllPost = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const sortBy = (req.query.sort || "newest").toLowerCase();

    let sortCondition = {};

    if (sortBy === "newest") sortCondition = { createdAt: -1 };
    if (sortBy === "top") sortCondition = { score: -1 };
    if (sortBy === "oldest") sortCondition = { createdAt: 1 };

    const posts = await postModel
      .find({ isDeleted: false })
      .sort(sortCondition)
      .limit(limit)
      .skip(skip)
      .populate("author", "name email")
      .lean()

    const postCount = await postModel.countDocuments({ isDeleted: false });

    res.status(200).json({ success: true, posts, total:postCount,page,limit});
  } catch (error) {
    console.log("Error during fetching all posts:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!isValidObjectId(postId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid author" });

    const post = await postModel
      .find(postId)
      .populate("author", "email name")
      .lean()

    if (!post || post.isDleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.log("Error during fetching the post:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //check authorization

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "moderator"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updatedPost = await postModel
      .findByIdAndUpdate(postId, { ...req.body }, { new: true })
      .populate("author", "name email");

    if (!updatedPost) {
      return res
        .status(400)
        .json({ success: false, message: "Post not updated" });
    }

    res
      .status(200)
      .json({ success: true, message: "Post updated succefully", updatedPost });
  } catch (error) {
    console.log("Error during updating the post:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await postModel.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    //check authorization

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.deleteOne();
    await commentModel.deleteMany({ post: postId });

    res.status(200).json({ success: true, message: "Post deleted succefully" });
  } catch (error) {
    console.log("Error during deleting the post:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const hardDeletePost = async (req, res) => {
  try {
    const postId = req.params;

    if (!isValidObjectId(postId))
      return res.status(400).json({ success: false, message: "Invalid post" });

    const post = await postModel.findById(postId);
    if (!post)
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });

    if (req.user.role !== "admin") {
      return res.status(400).json({ success: false, message: "Unauthorized" });
    }

    await commentModel.deleteMany({ post: postId });
    await voteModel.deleteMany({ post: postId });
    await likeCommentModel.deleteMany({ comment: { $in: post.comments } });
    await postModel.findByIdAndDelete(postId);

    return res.json({
      success: true,
      message: "Post hard deleted successfully (permanent)",
    });
  } catch (error) {
    console.log("Error during deleting the post parmanent:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  createPost,
  getAllPost,
  getPostById,
  updatePost,
  deletePost,
  hardDeletePost,
};
