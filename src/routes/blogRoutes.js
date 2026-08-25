import express from "express";
import upload from "../middleware/upload.js";
import { createBlog, getBlogs, getSingleBlog, updateBlog, deleteBlog } from "../controllers/blogController.js";

const router = express.Router();

// The order MUST be: Auth -> Multer -> Controller
// Make file upload optional to support image URLs
router.post("/", upload.single("image"), createBlog);
router.get("/", getBlogs);
router.get("/:slug", getSingleBlog);
router.put("/:id", upload.single("image"), updateBlog);
router.delete("/:id", deleteBlog);

export default router;