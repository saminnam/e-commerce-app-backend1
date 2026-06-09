import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";
import adminUser from "./models/AdminUser.js";
import adminUserRoutes from "./routes/dashboardUsers.js";
import compression from "compression";
import rateLimit from "express-rate-limit";
// USER SIDE ROUTES
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

// AUTH ROUTES
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Single CORS configuration
app.use(
  cors({
    // Removed the trailing slash at the end of the URL
    origin: [
  'https://e-commerce-app-admin-snowy.vercel.app/', 
  'https://e-commerce-app-frontend-opal.vercel.app' // Removed the trailing slash here!
],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    // Added this to ensure preflight requests (OPTIONS) pass smoothly
    optionsSuccessStatus: 200 
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Compression middleware to reduce response size
app.use(compression());

// Exclude auth routes from rate limiting
app.use('/api/auth', (req, res, next) => next());

// Exclude admin routes from rate limiting for development
app.use('/api/admin-users', (req, res, next) => next());

// Exclude products, cart, and profile routes from rate limiting for development
app.use('/api/products', (req, res, next) => next());
app.use('/api/cart', (req, res, next) => next());
app.use('/api/profile', (req, res, next) => next());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // increased limit for better user experience
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CREATE DEFAULT ADMIN
const createAdmin = async () => {
  try {
    const adminEmail = "admin@example.com";
    const existingAdmin = await adminUser.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await adminUser.create({
        name: "Admin",
        email: adminEmail,
        phone: "9999999999",
        password: hashedPassword,
        status: "active",
      });

      console.log("Default admin created:", adminEmail);
    } else {
      console.log("Admin already exists:", adminEmail);
    }
  } catch (error) {
    console.error("Error creating admin:", error.message);
  }
};

createAdmin();

// ROUTES
app.use("/api/admin-users", adminUserRoutes);

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blogs", blogRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});