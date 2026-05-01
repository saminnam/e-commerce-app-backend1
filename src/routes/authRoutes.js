// routes/authRoutes.js
import express from "express";
import { signup, login } from "../controllers/authController.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// GET ALL WEBSITE USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// DELETE WEBSITE USER
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
