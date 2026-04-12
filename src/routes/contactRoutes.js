import express from "express";
import Contact from "../models/contactModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newContact = await Contact.create(req.body);

    res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save data",
    });
  }
});

// GET all enquiries (for the dashboard)
router.get("/", async (req, res) => {
  try {
    const enquiries = await Contact.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// DELETE an enquiry
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting enquiry" });
  }
});

// UPDATE verified status (Checked/Not Checked)
router.patch("/:id/verify", async (req, res) => {
  try {
    const enquiry = await Contact.findById(req.params.id);
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

export default router; // ✅ VERY IMPORTANT
