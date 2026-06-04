import express from "express";
import { getAllHeroSlides, getHeroSlideById, createHeroSlide, updateHeroSlide, deleteHeroSlide } from "../controllers/heroSlideController.js";

const router = express.Router();

// Exclude hero slide routes from rate limiting for development
router.use((req, res, next) => next());

router.get("/", getAllHeroSlides);
router.get("/:id", getHeroSlideById);
router.post("/", createHeroSlide);
router.put("/:id", updateHeroSlide);
router.delete("/:id", deleteHeroSlide);

export default router;
