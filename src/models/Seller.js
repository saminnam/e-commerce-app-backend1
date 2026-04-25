import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  businessType: String,
  businessName: String,
  gst: String,
  pan: String,
  pickupAddress: String,
  bankHolderName: String,
  accountNumber: String,
  ifsc: String,
  category: String,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
