import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  address: { type: String, required: true },
  googleMapsLink: { type: String }, // For the "click to open" link
  mapEmbedUrl: { type: String },    // For the iframe src
  phone: { type: String, required: true },
  email: { type: String, required: true },
  facebook: { type: String },
  whatsappChat: { type: String },
  whatsappChannel: { type: String },
  youtube: { type: String },
}, { timestamps: true });

export default mongoose.model('Contact', ContactSchema);