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
import productRoutes from "./routes/profileRoutes.js";
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
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
//     methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
//     credentials: true,
//   })
// );

app.use(cors({
  origin: [
    'https://e-commerce-app-admin-snowy.vercel.app', // Your production Vercel frontend
    'http://localhost:5173',                         // Your local development port
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight options requests globally
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Compression middleware to reduce response size
app.use(compression());

// Exclude auth routes from rate limiting
app.use('/api/auth', (req, res, next) => next());

// Exclude admin routes from rate limiting for development
app.use('/api/admin-users', (req, res, next) => next());

// Exclude products, cart, profile, and roles routes from rate limiting for development
app.use('/api/products', (req, res, next) => next());
app.use('/api/cart', (req, res, next) => next());
app.use('/api/profile', (req, res, next) => next());
app.use('/api/roles', (req, res, next) => next());

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
app.use("/api/roles", roleRoutes);
app.use("/api/hero-slides", heroSlideRoutes);
app.use("/api/offer-hero-slides", offerHeroSlideRoutes);

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