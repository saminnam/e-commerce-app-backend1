import multer from "multer";
import path from "path";
import fs from "fs";

// Check if running in serverless environment (Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

let storage;

if (isServerless) {
  // Use memory storage for serverless environments
  storage = multer.memoryStorage();
} else {
  // Ensure uploads directory exists for local development
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Use disk storage for local development
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // Files will be stored in the 'uploads' folder
    },
    filename: function (req, file, cb) {
      // Saves file as: 1712945600-filename.jpg
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
}

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only (jpeg, jpg, png, gif, webp) are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;