import mongoose from "mongoose";
import commentModel from "../models/comment.model.js";
import postModel from "../models/post.model.js";
import likeCommentModel from "../models/likeCommentModel.js";
import userModel from "../models/user.model.js";
import { deleteCache, getCache, setCache } from "../services/cache.service.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const MAX_REPLY_DEPTH = 5;

//use to know the depth of the current commnet to be replied
const computeParentDepth = async (parentId) => {
  let depth = 0;
  let current = await commentModel
    .findById(parentId)
    .select("parentComment")
    .lean();

  while (current && current.parentComment) {
    depth += 1;

    if (depth >= MAX_REPLY_DEPTH) break;

    //update curret comment
    current = await commentModel
      .findById(current.parentComment)
      .select("parentComment")
      .lean();
  }

  return depth;
};

const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const commentedById = req.user._id;
    const postId = req.params.postId;

    if (!isValidObjectId(postId))
      return res.status(400).json({ success: false, message: "Invalid post" });

    if (
      !comment ||
      typeof comment !== "string" ||
      comment.trim().length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Add some text to comment" });
    }

    const post = await postModel.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    const newComment = await commentModel.create({
      comment: comment.trim(),
      commentedBy: commentedById,
      post: postId,
      parentComment: null,
    });

    if (!newComment) {
      return res
        .status(500)
        .json({ success: false, message: "New comment not created yet" });
    }

    const populatedComment = await newComment.populate(
      "commentedBy",
      "name email role"
    );

    post.comments.push(populatedComment._id);
    await post.save();

    await deleteCache(`comments:post:${postId}:*`);

    res.status(201).json({
      success: true,
      message: "You commented on post successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.log("Error during adding new comment:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const replyToComment = async (req, res) => {
  try {
    const { reply } = req.body;
    const userId = req.user._id;
    const parentId = req.params.commentId;

    if (!isValidObjectId(parentId))
      return res.status(400).json({ success: false, message: "Invalid post" });

    if (!reply || typeof reply !== "string" || reply.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Add some text to comment" });
    }

    const parent = await commentModel.findById(parentId);
    if (!parent){
      return res
        .status(404)
        .json({ success: false, message: "parent not found" });
    }

     const postId=parent.post.toString();

     if(!postId){
          return res
        .status(404)
        .json({ success: false, message: "parent not found" });
     }

    const depth = await computeParentDepth(parentId);

    if (depth >= MAX_REPLY_DEPTH) {
      return res
        .status(400)
        .json({ message: `Reply depth limit reached (${MAX_REPLY_DEPTH}).` });
    }

    const newReply = await commentModel.create({
      comment: reply.trim(),
      commentedBy: userId,
      post: parent.post,
      parentComment: parent._id,
    });

    if (!newReply) {
      return res
        .status(500)
        .json({ success: false, message: "New Reply not created yet" });
    }

    const populatedReply = await newReply.populate({
      path: "parentComment",
      populate: {
        path: "commentedBy",
        select: "name email role",
      },
    });

    await deleteCache(`comments:comment:${parentId}:*`);
    await deleteCache(`comments:post:${postId}:*`);

    res.status(201).json({
      success: true,
      message: "You replied on comment successfully",
      reply: populatedReply,
    });
  } catch (error) {
    console.log("Error during replying to comment:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Please select the comment to update",
      });
    }

    if (
      comment.commentedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "moderator"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

     const postId=comment.post.toString()

    const updatedComment = await commentModel
      .findByIdAndUpdate(commentId, { ...req.body }, { new: true })
      .populate("commentedBy", "name email");

    if (!updatedComment) {
      return res
        .status(500)
        .json({ success: false, message: "Comment not updated" });
    }

    await deleteCache(`comments:comment:${commentId}:*`);
    await deleteCache(`comments:post:${postId}:*`);

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      updatedComment,
    });
  } catch (error) {
    console.log("Error during updateing the comment:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    if (!isValidObjectId(commentId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment" });

    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ message: "Please select the comment to delete" });
    }

    if (
      comment.commentedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "moderator"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (comment.isDeleted) {
      return res
        .status(200)
        .json({ success: true, message: "Comment already deleted" });
    }

    const postId=comment.post.toString()

    comment.isDeleted = true;
    comment.comment = "";
    comment.deletedBy = req.user._id;

    await comment.save({ validateBeforeSave: false });

    await deleteCache(`comments:comment:${commentId}:*`);
    await deleteCache(`comments:post:${postId}:*`);

    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.log("Error during deleting the comment:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Please select post" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10)); //Limit of pages to be loaded at once
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10)); //limit of
    const repliesLimit = Math.min(
      10,
      parseInt(req.query.repliesLimit || "10", 10)
    );

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid Post" });
    }

    const skip = (page - 1) * limit;

    const key = `comments:post:${postId}:page:${page}:limit:${limit}`;

    const cachedData = await getCache(key);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        fromCache: true,
        page: cachedData.page,
        limit: cachedData.limit,
        totalTopCommentsCount: cachedData.totalTopCommentsCount,
        comments: cachedData.commentsWithReplies,
      });
    }

    const topComments = await commentModel
      .find({ post: postId, parentComment: null, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("commentedBy", "name role")
      .lean();

    if (!topComments) {
      return res
        .status(400)
        .json({ success: false, message: "No topComments" });
    }

    const commentsWithReplies = await Promise.all(
      topComments.map(async (comment) => {
        const replies = await commentModel
          .find({
            parentComment: comment._id,
            isDeleted: false,
          })
          .sort({ createdAt: 1 })
          .limit(repliesLimit)
          .populate("commentedBy", "name role")
          .lean();

        return { ...comment, replies };
      })
    );

    const totalTopCommentsCount = await commentModel.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false,
    });

    const cachedComments = {
      page,
      limit,
      totalTopCommentsCount,
      commentsWithReplies,
    };

    await setCache(key, cachedComments, 180);

    res.status(200).json({
      success: true,
      fromCache: false,
      page,
      limit,
      totalTopCommentsCount,
      comments: commentsWithReplies,
    });
  } catch (error) {
    console.log("Error during fetching the comments:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getThrededComments = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const parent = await commentModel.findById(commentId).lean();

    if (!parent) {
      return res.status(404).json({ message: "Please select comment" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10)); //Limit of pages to be loaded at once
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10)); //limit of

    if (!isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid Comment" });
    }

    const skip = (page - 1) * limit;

    const key = `comments:comment:${commentId}:page:${page}:limit:${limit}`;

    const cachedData = await getCache(key);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        fromCache: true,
        parent: cachedData.parent,
        page: cachedData.page,
        limit: cachedData.limit,
        totalReplies: cachedData.totalReplies,
        replies: cachedData.replies,
      });
    }

    const replies = await commentModel
      .find({
        parentComment: parent._id,
        isDeleted: false,
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("commentedBy", "name role")
      .lean();

    if (!replies) {
      return res
        .status(400)
        .json({ success: false, message: "No replies done yet" });
    }

    const totalReplies = await commentModel.countDocuments({
      parentComment: parent._id,
      isDeleted: false,
    });

    const cachedReplies = {
      parent,
      page,
      limit,
      totalReplies,
      replies,
    };

    await setCache(key, cachedReplies, 180);

    res.status(200).json({
      success: true,
      fromCache: false,
      parent,
      page,
      limit,
      totalReplies,
      replies,
    });
  } catch (error) {
    console.log("Error during fetching the threaded comments:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await postModel.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Please select post" });
    }

    const commentId=post.comments.toString()

    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await commentModel.updateMany(
      { post: postId },
      {
        isDeleted: true,
        comment: "",
        deletedBy: req.user._id,
      }
    );

    await deleteCache(`comments:post:${postId}:*`);
    await deleteCache(`comments:comment:${commentId}:*`);

    res.status(200).json({ success: true, message: "Deleted all comments" });
  } catch (error) {
    console.log("Error during deleting the comments by post:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const likeOnComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment" });

    const userId = req.user._id;

    const { value } = req.body;

    if (![-1, 1].includes(value))
      return res
        .status(400)
        .json({ success: false, message: "Invalid like value" });

    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res
        .status(400)
        .json({ success: false, message: "Comment not found" });
    }

     const postId=comment.post.toString()

    const userLiked = await userModel
      .findById(userId)
      .select("name email role");

    const existingLike = await likeCommentModel.findOne({
      user: userId,
      comment: commentId,
    });

    if (!existingLike) {
      await likeCommentModel.create({
        user: userId,
        comment: commentId,
        value,
      });

      if (value === 1) comment.like++;
      if (value === -1) comment.dislike++;

      comment.score = comment.like - comment.dislike;

      await comment.save();

      return res.status(200).json({
        success: true,
        message: "Comment get like by you",
        comment,
        userLiked,
      });
    } else if (existingLike.value === value) {
      await likeCommentModel.deleteOne();

      if (value === 1) comment.like--;
      if (value === -1) comment.dislike--;

      comment.score = comment.like - comment.dislike;

      await comment.save();

      return res
        .status(200)
        .json({ success: true, message: "Like removed", comment, userLiked });
    }

    existingLike.value = value;
    await existingLike.save();

    if (value === 1) {
      comment.like++;
      comment.dislike--;
    }
    if (value === -1) {
      comment.like--;
      comment.dislike--;
    }

    await comment.save();

    await deleteCache(`comments:comment:${commentId}:*`);
    await deleteCache(`comments:post:${postId}:*`);

    return res.status(200).json({
      success: true,
      message: "Like and dislike get switched",
      comment,
      userLiked,
    });
  } catch (error) {
    console.log("Error during like comment:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const hardDeleteComment = async (req, res) => {
  try {
    const commentId = req.params;

    if (!isValidObjectId(commentId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment" });

    const comment = await commentModel.findById(commentId);
    if (!comment)
      return res
        .status(400)
        .json({ success: false, message: "Comment not found" });


    if (req.user.role !== "admin") {
      return res.status(400).json({ success: false, message: "Unauthorized" });
    }

    const postId=comment.post.toString()

    await commentModel.findByIdAndDelete(commentId);
    await commentModel.deleteMany({ parentComment: commentId });
    await likeCommentModel.deleteMany({ comment: commentId });

    await deleteCache(`comments:comment:${commentId}:*`);
    await deleteCache(`comments:post:${postId}:*`);

    return res.json({
      success: true,
      message: "Comment hard deleted successfully (permanent)",
    });
  } catch (error) {
    console.log("Error during deleting the comment parmanent:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  addComment,
  replyToComment,
  deleteComment,
  getCommentsByPost,
  getThrededComments,
  deleteCommentsByPost,
  updateComment,
  likeOnComment,
  hardDeleteComment,
};
