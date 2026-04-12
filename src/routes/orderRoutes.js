import express from "express";
import Order from "../models/order.js";
import nodemailer from "nodemailer";

const router = express.Router();

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const { customer, shippingAddress, products, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products found" });
    }

    const order = new Order({
      customer,
      shippingAddress,
      products,
      totalAmount,
      totalProducts: products.length,
    });

    await order.save();

    res.status(201).json(order); // returns full order with customer info
  } catch (error) {
    console.error("ORDER SAVE ERROR 👉", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET ALL ORDERS (Admin)
router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// GET SINGLE ORDER (Admin)
router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});
// Helper to send email
const sendStatusEmail = async (customerEmail, orderStatus, orderId) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Update: ${orderStatus}`,
    html: `<h1>Order Status Update</h1>
           <p>Your order <strong>#${orderId}</strong> status has been updated to: <strong>${orderStatus}</strong>.</p>
           <p>Thank you for shopping with us!</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// UPDATE ORDER STATUS (Admin)
router.patch("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Send confirmation email
    try {
      await sendStatusEmail(order.customer.email, status, order._id);
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
      // We don't return error here so the status update still saves
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE ORDER
router.delete("/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order Deleted" });
});
export default router;
