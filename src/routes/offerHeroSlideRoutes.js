import express from "express";
import { getAllOfferHeroSlides, getOfferHeroSlideById, createOfferHeroSlide, updateOfferHeroSlide, deleteOfferHeroSlide } from "../controllers/offerHeroSlideController.js";

const router = express.Router();

// Exclude offer hero slide routes from rate limiting for development
router.use((req, res, next) => next());

router.get("/", getAllOfferHeroSlides);
router.get("/:id", getOfferHeroSlideById);
router.post("/", createOfferHeroSlide);
router.put("/:id", updateOfferHeroSlide);
router.delete("/:id", deleteOfferHeroSlide);

export default router;
