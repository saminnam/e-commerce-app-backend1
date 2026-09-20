import express from "express";
import {
  getCompanyInfo,
  updateCompanyInfo,
} from "../controllers/companyInfoController.js";

const router = express.Router();

router.get("/", getCompanyInfo);
router.put("/:id", updateCompanyInfo);

export default router;