import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    categoryImage: { type: String },
    images: [{ type: String }],
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    resellerPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    desc: String,
    productDetails: String,
    category: { type: String, required: true },
    author: String,
    publisher: String,
    releasedDate: String,
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
