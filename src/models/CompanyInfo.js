import mongoose from "mongoose";

const companyInfoSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    taxId: { type: String },
    website: { type: String },
    logo: { type: String },
  },
  { timestamps: true }
);

const CompanyInfo = mongoose.model("CompanyInfo", companyInfoSchema);
export default CompanyInfo;