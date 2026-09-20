import express from "express";
import {
  sendInvoiceEmail,
  getInvoiceHTML,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/html/:orderId", getInvoiceHTML);
router.post("/send/:orderId", sendInvoiceEmail);

export default router;