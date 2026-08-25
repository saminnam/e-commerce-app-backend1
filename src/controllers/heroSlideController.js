import HeroSlide from "../models/HeroSlide.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getAllHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ status: "active" }).sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHeroSlideById = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: "Hero slide not found" });
    }
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHeroSlide = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const { title, order, status, desktopImg: desktopImgUrl, mobileImg: mobileImgUrl } = req.body;

    // Get the base URL dynamically from the request - always use HTTPS
    const protocol = req.secure ? 'https' : 'https'; // Force HTTPS
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle desktop image - try Cloudinary first
    let desktopImg = desktopImgUrl || "";
    if (req.files && req.files.desktopImg && req.files.desktopImg[0]) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.files.desktopImg[0], 'hero-slides');
        if (cloudinaryUrl) {
          desktopImg = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.files.desktopImg[0].filename) {
            desktopImg = `${baseUrl}/uploads/${req.files.desktopImg[0].filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.files.desktopImg[0].filename) {
          desktopImg = `${baseUrl}/uploads/${req.files.desktopImg[0].filename}`;
        }
      }
    }

    // Handle mobile image - try Cloudinary first
    let mobileImg = mobileImgUrl || "";
    if (req.files && req.files.mobileImg && req.files.mobileImg[0]) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.files.mobileImg[0], 'hero-slides');
        if (cloudinaryUrl) {
          mobileImg = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.files.mobileImg[0].filename) {
            mobileImg = `${baseUrl}/uploads/${req.files.mobileImg[0].filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.files.mobileImg[0].filename) {
          mobileImg = `${baseUrl}/uploads/${req.files.mobileImg[0].filename}`;
        }
      }
    }

    console.log("Final desktopImg:", desktopImg);
    console.log("Final mobileImg:", mobileImg);

    // Validate image URLs - prevent saving invalid paths
    if (desktopImg.includes('/uploads/undefined') || desktopImg.includes('/uploads/null')) {
      desktopImg = "";
    }
    if (mobileImg.includes('/uploads/undefined') || mobileImg.includes('/uploads/null')) {
      mobileImg = "";
    }

    const slide = await HeroSlide.create({
      title,
      desktopImg,
      mobileImg,
      order: order || 0,
      status: status || "active"
    });

    res.status(201).json(slide);
  } catch (error) {
    console.error("Hero slide creation error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateHeroSlide = async (req, res) => {
  try {
    const { title, order, status, desktopImg: desktopImgUrl, mobileImg: mobileImgUrl } = req.body;

    // Get the base URL dynamically from the request - always use HTTPS
    const protocol = req.secure ? 'https' : 'https'; // Force HTTPS
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle desktop image - try Cloudinary first
    let desktopImg = desktopImgUrl || "";
    if (req.files && req.files.desktopImg && req.files.desktopImg[0]) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.files.desktopImg[0], 'hero-slides');
        if (cloudinaryUrl) {
          desktopImg = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.files.desktopImg[0].filename) {
            desktopImg = `${baseUrl}/uploads/${req.files.desktopImg[0].filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.files.desktopImg[0].filename) {
          desktopImg = `${baseUrl}/uploads/${req.files.desktopImg[0].filename}`;
        }
      }
    }

    // Handle mobile image - try Cloudinary first
    let mobileImg = mobileImgUrl || "";
    if (req.files && req.files.mobileImg && req.files.mobileImg[0]) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.files.mobileImg[0], 'hero-slides');
        if (cloudinaryUrl) {
          mobileImg = cloudinaryUrl;
        } else {
          // Fallback to local disk storage if Cloudinary fails
          if (req.files.mobileImg[0].filename) {
            mobileImg = `${baseUrl}/uploads/${req.files.mobileImg[0].filename}`;
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using fallback:', cloudinaryError);
        // Fallback to local disk storage
        if (req.files.mobileImg[0].filename) {
          mobileImg = `${baseUrl}/uploads/${req.files.mobileImg[0].filename}`;
        }
      }
    }

    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      { title, desktopImg, mobileImg, order, status },
      { new: true }
    );

    if (!slide) {
      return res.status(404).json({ message: "Hero slide not found" });
    }

    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: "Hero slide not found" });
    }

    res.json({ message: "Hero slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
