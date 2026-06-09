import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";
import adminUser from "./models/AdminUser.js";
import adminUserRoutes from "./routes/dashboardUsers.js";
import roleRoutes from "./routes/roleRoutes.js";
import heroSlideRoutes from "./routes/heroSlideRoutes.js";
import offerHeroSlideRoutes from "./routes/offerHeroSlideRoutes.js";
import compression from "compression";
import rateLimit from "express-rate-limit";

// USER SIDE ROUTES
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js"; // 🛑 FIXED: Pointed to productRoutes instead of profileRoutes
import orderRoutes from "./routes/orderRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

// AUTH ROUTES
import profileRoutes from "./routes/profileRoutes.js";

// MIDDLEWARE
// 🛑 FIXED: Make sure to import your verifyToken middleware here. Update the path if yours is different!
import { verifyToken } from "./middleware/authMiddleware.js"; 

dotenv.config();  
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      'https://e-commerce-app-admin-snowy.vercel.app',
      'https://e-commerce-app-frontend-opal.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Compression middleware to reduce response size
app.use(compression());

// Exclude auth routes from rate limiting
app.use('/api/auth', (req, res, next) => next());
app.use('/api/admin-users', (req, res, next) => next());
app.use('/api/products', (req, res, next) => next());
app.use('/api/cart', (req, res, next) => next());
app.use('/api/profile', (req, res, next) => next());
app.use('/api/roles', (req, res, next) => next());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, 
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

// Static folders
app.use("/uploads", express.static("uploads"));

// =========================================================
// 1. PUBLIC ROUTES (Accessible without logging in)
// =========================================================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Users can look at products freely!
app.use("/api/blogs", blogRoutes);       // Anyone can read your blogs
app.use("/api/contact", contactRoutes);   // Contact form should be open

// =========================================================
// 2. PROTECTED ROUTES (Requires validation token)
// =========================================================
// Putting verifyToken here shields only the routes listed underneath it
app.use(verifyToken); 

app.use("/api/admin-users", adminUserRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/hero-slides", heroSlideRoutes);
app.use("/api/offer-hero-slides", offerHeroSlideRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/seller", sellerRoutes);

// =========================================================

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});