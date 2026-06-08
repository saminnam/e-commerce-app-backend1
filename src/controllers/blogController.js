import Blog from "../models/Blog.js";

export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, category, readTime, content, date } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        message: "Title and content are required",
        received: { title, content }
      });
    }

    let image = "";

    if (req.file) {
      image = req.file.filename;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const blog = await Blog.create({
      title,
      excerpt,
      category,
      readTime,
      image,
      content,
      date,
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error("Blog Creation Error:", error.message);
    console.error("Full Error:", error);
    res.status(500).json({ 
      message: error.message,
      errorType: error.name 
    });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    // Check if blog exists first
    const existingBlog = await Blog.findById(req.params.id);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(blog);
  } catch (error) {
    console.error("Blog Update Error:", error.message);
    res.status(500).json({ 
      message: error.message,
      errorType: error.name 
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    res.json({ message: "Blog deleted successfully", deletedBlog: blog });
  } catch (error) {
    console.error("Blog Delete Error:", error.message);
    res.status(500).json({ 
      message: error.message,
      errorType: error.name 
    });
  }
};
