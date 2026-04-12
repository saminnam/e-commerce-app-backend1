import express from "express";
import Seller from "../models/seller.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newSeller = new Seller(req.body);
    await newSeller.save();

    res.status(201).json({
      success: true,
      message: "Seller registration successful!",
    });
  } catch (error) {
    console.error("SELLER REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error registering seller",
    });
  }
});

// Add these to your existing seller routes file
router.get("/", async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Seller.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Seller removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/toggle-verify", async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    seller.isVerified = !seller.isVerified; // You'll need to add isVerified: Boolean to your Schema
    await seller.save();
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
