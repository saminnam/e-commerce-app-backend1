import HeroSlide from "../models/HeroSlide.js";

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
    const { title, order, status, desktopImg: desktopImgUrl, mobileImg: mobileImgUrl } = req.body;

    // Get the base URL dynamically from the request
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle desktop image
    let desktopImg = desktopImgUrl || "";
    if (req.files && req.files.desktopImg && req.files.desktopImg[0]) {
      desktopImg = `${baseUrl}/uploads/${req.files.desktopImg[0].filename}`;
    }

    // Handle mobile image
    let mobileImg = mobileImgUrl || "";
    if (req.files && req.files.mobileImg && req.files.mobileImg[0]) {
      mobileImg = `${baseUrl}/uploads/${req.files.mobileImg[0].filename}`;
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
    res.status(500).json({ message: error.message });
  }
};

export const updateHeroSlide = async (req, res) => {
  try {
    const { title, order, status, desktopImg: desktopImgUrl, mobileImg: mobileImgUrl } = req.body;

    // Get the base URL dynamically from the request
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle desktop image
    let desktopImg = desktopImgUrl || "";
    if (req.files && req.files.desktopImg && req.files.desktopImg[0]) {
      desktopImg = `${baseUrl}/uploads/${req.files.desktopImg[0].filename}`;
    }

    // Handle mobile image
    let mobileImg = mobileImgUrl || "";
    if (req.files && req.files.mobileImg && req.files.mobileImg[0]) {
      mobileImg = `${baseUrl}/uploads/${req.files.mobileImg[0].filename}`;
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
