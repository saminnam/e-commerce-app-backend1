import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Stores uploaded image filename (served from /uploads)
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);


const Category = mongoose.model("Category", categorySchema);
export default Category;
