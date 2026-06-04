import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  desktopImg: {
    type: String,
    required: true
  },
  mobileImg: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, {
  timestamps: true
});

export default mongoose.model("HeroSlide", heroSlideSchema);
