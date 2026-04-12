import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Files will be stored in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Saves file as: 1712945600-filename.jpg
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
export default upload;