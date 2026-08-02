import express from "express";
import upload from "../middleware/upload.js";
import { getAllOfferHeroSlides, getOfferHeroSlideById, createOfferHeroSlide, updateOfferHeroSlide, deleteOfferHeroSlide } from "../controllers/offerHeroSlideController.js";

const router = express.Router();

// Exclude offer hero slide routes from rate limiting for development
router.use((req, res, next) => next());

router.get("/", getAllOfferHeroSlides);
router.get("/:id", getOfferHeroSlideById);
router.post("/", upload.single("img"), createOfferHeroSlide);
router.put("/:id", upload.single("img"), updateOfferHeroSlide);
router.delete("/:id", deleteOfferHeroSlide);

export default router;
