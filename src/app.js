import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";
import adminUser from "./models/AdminUser.js";
import adminUserRoutes from "./routes/dashboardUsers.js";
import compression from "compression";
import rateLimit from "express-rate-limit";
import multer from "multer";
// USER SIDE ROUTES
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import heroSlideRoutes from "./routes/heroSlideRoutes.js";
import offerHeroSlideRoutes from "./routes/offerHeroSlideRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";

// AUTH ROUTES
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();
connectDB();
const app = express();


// ✅ CORS (ensure headers are present even on OPTIONS / preflight)
const corsOptions = {
  origin: [
    'https://admin.baqavibookcentre.com',
    'https://www.baqavibookcentre.com',
    'https://baqavibookcentre.com',
    'http://localhost:5174',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('/', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err.message && err.message.includes('Images only')) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

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
app.use("/api/hero-slides", heroSlideRoutes);
app.use("/api/offerHero-slides", offerHeroSlideRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/roles", roleRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
