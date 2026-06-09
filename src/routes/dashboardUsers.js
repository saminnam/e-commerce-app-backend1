import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"; // 🛑 ADDED: For ObjectId validation
import User from "../models/AdminUser.js";
import Role from "../models/Role.js";

const router = express.Router();

// CREATE USER
router.post("/", async (req, res) => {
  const { name, email, phone, password, role, status } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Validate role format if provided
    if (role && !mongoose.Types.ObjectId.isValid(role)) {
      return res.status(400).json({ message: "Invalid role ID format" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(), // 🛑 FIX: Prevent casing duplicate issues (e.g., Admin@vs admin@)
      phone,
      password: hashedPassword,
      role: role || null,
      status: status || "active",
    });

    // Strip password from the response object
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ message: "User created successfully", user: userResponse });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate('role').select("-password");
    res.json(users);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  try {
    // 🛑 FIX: Validate ID format to prevent Mongoose CastError crash
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// UPDATE USER
router.put("/:id", async (req, res) => {
  try {
    // 🛑 FIX: Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const { name, email, phone, role, status } = req.body;
    
    // Build explicit update payload to prevent accidental field clearing
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) {
      if (role && !mongoose.Types.ObjectId.isValid(role)) {
        return res.status(400).json({ message: "Invalid role ID format" });
      }
      updateData.role = role || null;
    }
    if (status !== undefined) updateData.status = status;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // 🛑 FIX: Use explicit $set operation
      { new: true, runValidators: true }
    ).populate('role').select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.code === 11000 ? "Email already in use" : "Update failed" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 🛑 FIX: Query with lowercased/trimmed email
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail }).populate('role');
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive. Please contact administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🛑 SECURITY FIX: Fallback safely if JWT_SECRET isn't picked up by dotenv
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error("CRITICAL ERROR: JWT_SECRET environment variable is not defined!");
      return res.status(500).json({ message: "Internal server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role?.name || "admin" },
      secretKey,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?.name || "admin",
        roleId: user.role?._id || null,
        status: user.status,
        permissions: user.role?.permissions || []
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;