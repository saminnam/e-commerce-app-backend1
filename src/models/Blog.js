import mongoose from "mongoose";
import slugify from "slugify";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    category: {
      type: String,
      trim: true,
      index: true,
    },

    readTime: {
      type: String,
      trim: true,
      default: "5 min read",
    },

    image: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
        }),
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

// ✅ FIXED HERE
blogSchema.pre("save", function () {
  if (this.title) {
    this.slug =
      slugify(this.title, { lower: true, strict: true }) +
      "-" +
      Date.now();
  }
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;