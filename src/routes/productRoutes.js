import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/upload.js";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// CREATE PRODUCT
router.post("/", upload.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]), async (req, res) => {
  try {
    const { name, slug, mrp, price, discount, stock, status, category, desc, productDetails, author, rating } = req.body;

    // Handle main image - try Cloudinary first
    let imagePath = req.body.image || "";
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.files.image[0], 'products');
        if (cloudinaryUrl) {
          imagePath = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.files.image[0].filename) {
            const protocol = req.secure ? 'https' : 'https';
            const host = req.get("host");
            imagePath = `${protocol}://${host}/uploads/${req.files.image[0].filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.files.image[0].filename) {
          const protocol = req.secure ? 'https' : 'https';
          const host = req.get("host");
          imagePath = `${protocol}://${host}/uploads/${req.files.image[0].filename}`;
        }
      }
    }
    
    // Validate image URL - prevent saving invalid paths
    if (imagePath.includes('/uploads/undefined') || imagePath.includes('/uploads/null')) {
      imagePath = ""; // Clear invalid image paths
    }

    // Handle gallery images - try Cloudinary first
    let galleryImages = [];
    if (req.body.images) {
      galleryImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    if (req.files && req.files.images && req.files.images.length > 0) {
      try {
        const cloudinaryUrls = await uploadMultipleToCloudinary(req.files.images, 'products');
        if (cloudinaryUrls.length > 0) {
          galleryImages = cloudinaryUrls;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.files.images[0].filename) {
            const protocol = req.secure ? 'https' : 'https';
            const host = req.get("host");
            galleryImages = req.files.images.map(file => `${protocol}://${host}/uploads/${file.filename}`);
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary multiple upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.files.images[0].filename) {
          const protocol = req.secure ? 'https' : 'https';
          const host = req.get("host");
          galleryImages = req.files.images.map(file => `${protocol}://${host}/uploads/${file.filename}`);
        }
      }
    }
    
    // Validate gallery image URLs - filter out invalid paths
    galleryImages = galleryImages.filter(img => 
      !img.includes('/uploads/undefined') && !img.includes('/uploads/null')
    );

    const product = await Product.create({
      name,
      slug,
      image: imagePath,
      images: galleryImages,
      mrp,
      price,
      discount,
      stock,
      status,
      category,
      desc,
      productDetails,
      author,
      rating,
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("Product Creation Error:", err.message);
    console.error("Full Error:", err);
    res.status(400).json({ 
      message: err.message,
      errorType: err.name,
      details: err.errors ? Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      })) : null
    });
  }
});

// GET ALL PRODUCTS (with pagination)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments();
    
    res.json({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", upload.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]), async (req, res) => {
  try {
    const { name, slug, mrp, price, discount, stock, status, category, desc, productDetails, author, rating } = req.body;

    const updateData = { name, slug, mrp, price, discount, stock, status, category, desc, productDetails, author, rating };

    // Handle main image - try Cloudinary first
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.files.image[0], 'products');
        if (cloudinaryUrl) {
          updateData.image = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.files.image[0].filename) {
            const protocol = req.secure ? 'https' : 'https';
            const host = req.get("host");
            updateData.image = `${protocol}://${host}/uploads/${req.files.image[0].filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.files.image[0].filename) {
          const protocol = req.secure ? 'https' : 'https';
          const host = req.get("host");
          updateData.image = `${protocol}://${host}/uploads/${req.files.image[0].filename}`;
        }
      }
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }
    
    // Validate image URL - prevent saving invalid paths
    if (updateData.image && (updateData.image.includes('/uploads/undefined') || updateData.image.includes('/uploads/null'))) {
      delete updateData.image; // Remove invalid image paths
    }

    // Handle gallery images - try Cloudinary first
    if (req.files && req.files.images && req.files.images.length > 0) {
      try {
        const cloudinaryUrls = await uploadMultipleToCloudinary(req.files.images, 'products');
        if (cloudinaryUrls.length > 0) {
          updateData.images = cloudinaryUrls;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.files.images[0].filename) {
            const protocol = req.secure ? 'https' : 'https';
            const host = req.get("host");
            updateData.images = req.files.images.map(file => `${protocol}://${host}/uploads/${file.filename}`);
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary multiple upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.files.images[0].filename) {
          const protocol = req.secure ? 'https' : 'https';
          const host = req.get("host");
          updateData.images = req.files.images.map(file => `${protocol}://${host}/uploads/${file.filename}`);
        }
      }
    } else if (req.body.images) {
      updateData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    
    // Validate gallery image URLs - filter out invalid paths
    if (updateData.images) {
      updateData.images = updateData.images.filter(img => 
        !img.includes('/uploads/undefined') && !img.includes('/uploads/null')
      );
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
