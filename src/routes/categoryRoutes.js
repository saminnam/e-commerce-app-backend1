 import express from "express";
import Category from "../models/Category.js";
import upload from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (supports image upload OR image URL)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Get the base URL dynamically from the request - always use HTTPS
    const protocol = req.secure ? 'https' : 'https';
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle image - try Cloudinary first
    let image = imageUrl || "";
    if (req.file) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.file, 'categories');
        if (cloudinaryUrl) {
          image = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.file.filename) {
            image = `${baseUrl}/uploads/${req.file.filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.file.filename) {
          image = `${baseUrl}/uploads/${req.file.filename}`;
        }
      }
    }

    // Validate image URL - prevent saving invalid paths
    if (image.includes('/uploads/undefined') || image.includes('/uploads/null')) {
      image = "";
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      image,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category (supports image upload OR image URL)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, imageUrl } = req.body;

    const updatePayload = { ...req.body };
    if (name) {
      updatePayload.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Get the base URL dynamically from the request - always use HTTPS
    const protocol = req.secure ? 'https' : 'https';
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle image - try Cloudinary first
    if (req.file) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.file, 'categories');
        if (cloudinaryUrl) {
          updatePayload.image = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.file.filename) {
            updatePayload.image = `${baseUrl}/uploads/${req.file.filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.file.filename) {
          updatePayload.image = `${baseUrl}/uploads/${req.file.filename}`;
        }
      }
    } else if (imageUrl) {
      updatePayload.image = imageUrl;
    }

    // Validate image URL - prevent saving invalid paths
    if (updatePayload.image && (updatePayload.image.includes('/uploads/undefined') || updatePayload.image.includes('/uploads/null'))) {
      delete updatePayload.image;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

