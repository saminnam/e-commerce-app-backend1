import express from "express";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import auth from "./middleware/auth.js";

const router = express.Router();

// CREATE PRODUCT (Admin only)
router.post("/", auth("admin"), async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Product data is required",
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// GET ALL PRODUCTS (Public)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 50);

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(),
    ]);

    res.json({
      products,
      pagination: {
        current: page,
        limit,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// UPDATE PRODUCT (Admin only)
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID format",
      });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// DELETE PRODUCT (Admin only)
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID format",
      });
    }

    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;