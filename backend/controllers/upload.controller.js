import postModel from "../models/post.model.js";

const uploadFile = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    }

    let imgUrl = null;

    if (req.file) {
      imgUrl = `/uploads/posts/${req.file.filename}`;
    }

    const post = await postModel.create({
      title,
      content,
      image: imgUrl,
      author: req.user._id,
    });

    if (!post) {
      return res.status(400).json({ message: "Post not created" });
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  }
};


export default uploadFile
