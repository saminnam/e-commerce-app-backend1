import express from "express";
import { getAllRoles, createRole, updateRole, deleteRole } from "../controllers/roleController.js";

const router = express.Router();

// Exclude role routes from rate limiting for development
router.use((req, res, next) => next());

router.get("/", getAllRoles);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
