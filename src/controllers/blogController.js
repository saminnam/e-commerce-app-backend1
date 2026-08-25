import Blog from "../models/Blog.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

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

    // Get the base URL dynamically from the request - always use HTTPS
    const protocol = req.secure ? 'https' : 'https'; // Force HTTPS
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle image - try Cloudinary first
    let image = req.body.image || "";
    if (req.file) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.file, 'blogs');
        if (cloudinaryUrl) {
          image = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.file.filename) {
            image = `${baseUrl}/uploads/${req.file.filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.file.filename) {
          image = `${baseUrl}/uploads/${req.file.filename}`;
        }
      }
    }
    
    // Validate image URL - prevent saving invalid paths
    if (image.includes('/uploads/undefined') || image.includes('/uploads/null')) {
      image = ""; // Clear invalid image paths
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

    // Get the base URL dynamically from the request - always use HTTPS
    const protocol = req.secure ? 'https' : 'https'; // Force HTTPS
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle image - try Cloudinary first
    let image = req.body.image || existingBlog.image;
    if (req.file) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.file, 'blogs');
        if (cloudinaryUrl) {
          image = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.file.filename) {
            image = `${baseUrl}/uploads/${req.file.filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.file.filename) {
          image = `${baseUrl}/uploads/${req.file.filename}`;
        }
      }
    }
    
    // Validate image URL - prevent saving invalid paths
    if (image.includes('/uploads/undefined') || image.includes('/uploads/null')) {
      image = existingBlog.image || ""; // Clear invalid image paths, keep existing if available
    }

    const updateData = { ...req.body, image };

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
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
