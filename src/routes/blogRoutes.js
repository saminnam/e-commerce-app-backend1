import express from "express";
import upload from "../middleware/upload.js";
import Blog from "../models/Blog.js";
import { createBlog, getBlogs, getSingleBlog, updateBlog, deleteBlog } from "../controllers/blogController.js";
// import { verifyToken } from "../middleware/authMiddleware.js"; // Ensure this import is correct!

const router = express.Router();

// The order MUST be: Auth -> Multer -> Controller
// If you don't want to require login, remove verifyToken
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Get the base URL dynamically from the request
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // If req.file exists, the user uploaded a file.
    // If not, we take the URL string from req.body.image.
    const imagePath = req.file 
      ? `${baseUrl}/uploads/${req.file.filename}` 
      : req.body.image;

    const newBlog = new Blog({
      ...req.body,
      image: imagePath // This saves the usable URL to the database
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    console.error("Blog creation error:", err); // Log detailed error
    res.status(500).json({ message: err.message });
  }
}); 

router.get("/", getBlogs);
router.get("/:slug", getSingleBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;