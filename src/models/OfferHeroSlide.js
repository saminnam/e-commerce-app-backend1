import mongoose from "mongoose";

const offerHeroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subTitle: {
    type: String,
    required: true,
    trim: true
  },
  img: {
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

export default mongoose.model("OfferHeroSlide", offerHeroSlideSchema);
