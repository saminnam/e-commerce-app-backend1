import express from "express";
import Contact from "../models/Contact.js";
import Enquiry from "../models/Enquiry.js";

const router = express.Router();

// POST - Create new enquiry (from contact form)
router.post("/enquiry", async (req, res) => {
  try {
    console.log("Received enquiry data:", req.body);
    const newContact = await Enquiry.create(req.body);

    res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Error saving form:", error);
    console.error("Error details:", error.message);
    console.error("Validation errors:", error.errors);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save data",
      errors: error.errors
    });
  }
});

// GET all enquiries (for the dashboard)
router.get("/enquiries", async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// DELETE an enquiry
router.delete("/enquiries/:id", async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting enquiry" });
  }
});

// UPDATE verified status (Checked/Not Checked)
router.patch("/enquiries/:id/verify", async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Toggle the verified boolean
    enquiry.verified = !enquiry.verified;
    await enquiry.save();

    res.status(200).json(enquiry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Routes for managing contact information (single document)
// GET contact information (for frontend)
router.get("/info", async (req, res) => {
  try {
    const contactInfo = await Contact.findOne();
    if (!contactInfo) {
      return res.status(404).json({ message: "Contact information not found" });
    }
    res.status(200).json(contactInfo);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// PUT/UPDATE contact information (for admin panel)
router.put("/info", async (req, res) => {
  try {
    const { address, phone, email } = req.body;

    // Validate required fields
    if (!address || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: {
          address: !address ? "Address is required" : undefined,
          phone: !phone ? "Phone is required" : undefined,
          email: !email ? "Email is required" : undefined,
        },
      });
    }

    const contactInfo = await Contact.findOne();
    if (contactInfo) {
      const updated = await Contact.findByIdAndUpdate(contactInfo._id, req.body, { new: true, runValidators: true });
      res.status(200).json({
        success: true,
        message: "Contact information updated successfully",
        data: updated,
      });
    } else {
      const newContactInfo = await Contact.create(req.body);
      res.status(201).json({
        success: true,
        message: "Contact information created successfully",
        data: newContactInfo,
      });
    }
  } catch (error) {
    console.error("Error updating contact info:", error);
    // Return detailed validation errors if present
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {}),
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update contact information",
      error: error.message,
    });
  }
});

export default router;
