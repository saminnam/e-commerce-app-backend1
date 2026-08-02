import express from "express";
import upload from "../middleware/upload.js";
import { getAllHeroSlides, getHeroSlideById, createHeroSlide, updateHeroSlide, deleteHeroSlide } from "../controllers/heroSlideController.js";

const router = express.Router();

// Exclude hero slide routes from rate limiting for development
router.use((req, res, next) => next());

router.get("/", getAllHeroSlides);
router.get("/:id", getHeroSlideById);
router.post("/", upload.fields([{ name: "desktopImg", maxCount: 1 }, { name: "mobileImg", maxCount: 1 }]), createHeroSlide);
router.put("/:id", upload.fields([{ name: "desktopImg", maxCount: 1 }, { name: "mobileImg", maxCount: 1 }]), updateHeroSlide);
router.delete("/:id", deleteHeroSlide);

export default router;
