import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || null,
      status: status || "active",
    });

    // Security Fix: Do not return the hashed password in the response object
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
    // Optimization: Added .lean() for faster execution and less memory overhead
    const users = await User.find().populate('role').select("-password").lean();
    res.json(users);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

// UPDATE USER
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, role, status, password } = req.body;
    
    // Build update object dynamically
    const updateData = { name, email, phone, role, status };

    // Enhancement: Securely hash password if the client tries to update it
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('role').select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for email:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("User found:", user.email, "Status:", user.status);

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive. Please contact administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Safety Alert: Warn developer if your .env file isn't injecting properly
    if (!process.env.JWT_SECRET) {
      console.warn("WARNING: JWT_SECRET is not defined in environment variables. Falling back to default string.");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role?.name || "admin" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    console.log("Login successful for:", user.email);

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