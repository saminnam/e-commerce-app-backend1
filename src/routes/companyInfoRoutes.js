import express from "express";
import multer from "multer";
import {
  getCompanyInfo,
  updateCompanyInfo,
} from "../controllers/companyInfoController.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload logo endpoint
router.post("/upload-logo", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(req.file, 'company-logos');
    
    if (!cloudinaryUrl) {
      return res.status(500).json({ success: false, message: "Failed to upload to Cloudinary" });
    }

    res.json({ success: true, url: cloudinaryUrl });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", getCompanyInfo);
router.put("/:id", updateCompanyInfo);

export default router;