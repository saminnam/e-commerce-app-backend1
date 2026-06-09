import express from "express";
import mongoose from "mongoose"; // Added to validate ObjectIds
import Product from "../models/Product.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE PRODUCT
router.post("/", auth("admin"), async (req, res) => {
  try {
    // Basic validation to ensure req.body isn't empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Product data is required" });
    }
    
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET ALL PRODUCTS (with pagination)
router.get("/", async (req, res) => {
  try {
    // Prevent negative numbers or zero for page/limit
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    // Run queries in parallel for better performance
    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments()
    ]);
    
    res.json({
      products,
      pagination: {
        current: page,
        limit, // Good practice to return the limit used
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    // 1. Validate ID format before touching the database
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // 2. Check if the product actually exists before trying to delete
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // 2. Run updates with validators turned on
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Forces Mongoose to check your schema rules on update
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;