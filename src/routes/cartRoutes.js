import express from "express";
import Cart from "../models/Cart.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// GET cart for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST/UPDATE cart for logged-in user
router.post("/", auth, async (req, res) => {
  try {
    const { items } = req.body;
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (cart) {
      // Update existing cart
      cart.items = items;
      await cart.save();
    } else {
      // Create new cart
      cart = new Cart({
        userId: req.user.id,
        items,
      });
      await cart.save();
    }
    
    const populatedCart = await Cart.findById(cart._id).populate("items.productId");
    res.json(populatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE cart for logged-in user
router.delete("/", auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
