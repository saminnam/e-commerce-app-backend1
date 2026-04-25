import mongoose from "mongoose";
import Contact from "./models/Contact.js";
import dotenv from "dotenv";

dotenv.config();

const seedContactData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if contact info already exists
    const existingContact = await Contact.findOne();
    if (existingContact) {
      console.log("Contact information already exists. Skipping seed.");
      process.exit(0);
    }

    // Original contact data from the frontend
    const contactData = {
      address: "Near Eidgah Masjid, Angappan Street, Mannady, Chennai - 600 001",
      googleMapsLink: "https://maps.app.goo.gl/w1NTwN4vjaNUMxXg8",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d15543.904437821024!2d80.289125!3d13.1007!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTPCsDA2JzAyLjUiTiA4MMKwMTcnMzAuMSJF!5e0!3m2!1sen!2sin!4v1764492405085!5m2!1sen!2sin",
      phone: "+91 74488 88336",
      email: "baqavibookcentre@gmail.com",
      facebook: "https://www.facebook.com/BaqaviBooks?rdid=46rRSBkAd9aifITY&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CBcqbsNFV%2F#",
      whatsappChat: "https://wa.me/+917448888336",
      whatsappChannel: "https://www.whatsapp.com/channel/0029VbAm1L15EjxsYm8ndw0b",
      youtube: "https://www.youtube.com/@baqavibookcentre",
    };

    await Contact.create(contactData);
    console.log("Contact information seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding contact data:", error);
    process.exit(1);
  }
};

seedContactData();
