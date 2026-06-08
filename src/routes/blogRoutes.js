import express from "express";
import upload from "../middleware/upload.js";
import Blog from "../models/Blog.js";
import { createBlog, getBlogs, getSingleBlog, updateBlog, deleteBlog } from "../controllers/blogController.js";
// import { verifyToken } from "../middleware/authMiddleware.js"; // Ensure this import is correct!

const router = express.Router();

// The order MUST be: Auth -> Multer -> Controller
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Validate required fields before processing
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({ 
        message: "Title and content are required" 
      });
    }

    // Get the base URL dynamically from the request
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // If req.file exists, the user uploaded a file.
    // If not, we take the URL string from req.body.image.
    let imagePath = req.body.image || "";
    if (req.file) {
      imagePath = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const newBlog = new Blog({
      title: req.body.title,
      excerpt: req.body.excerpt || "",
      category: req.body.category || "",
      readTime: req.body.readTime || "5 min read",
      image: imagePath,
      content: req.body.content,
      date: req.body.date || new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      }),
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    console.error("Blog creation error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ 
      message: err.message || "Failed to create blog",
      errorType: err.name
    });
  }
}); 

router.get("/", getBlogs);
router.get("/:slug", getSingleBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;