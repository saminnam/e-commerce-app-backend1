import OfferHeroSlide from "../models/OfferHeroSlide.js";

export const getAllOfferHeroSlides = async (req, res) => {
  try {
    const slides = await OfferHeroSlide.find({ status: "active" }).sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOfferHeroSlideById = async (req, res) => {
  try {
    const slide = await OfferHeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: "Offer hero slide not found" });
    }
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOfferHeroSlide = async (req, res) => {
  try {
    const { title, subTitle, order, status, img: imgUrl } = req.body;

    // Get the base URL dynamically from the request
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle image
    let img = imgUrl || "";
    if (req.file) {
      img = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const slide = await OfferHeroSlide.create({
      title,
      subTitle,
      img,
      order: order || 0,
      status: status || "active"
    });

    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOfferHeroSlide = async (req, res) => {
  try {
    const { title, subTitle, order, status, img: imgUrl } = req.body;

    // Get the base URL dynamically from the request
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Handle image
    let img = imgUrl || "";
    if (req.file) {
      img = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const slide = await OfferHeroSlide.findByIdAndUpdate(
      req.params.id,
      { title, subTitle, img, order, status },
      { new: true }
    );

    if (!slide) {
      return res.status(404).json({ message: "Offer hero slide not found" });
    }

    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOfferHeroSlide = async (req, res) => {
  try {
    const slide = await OfferHeroSlide.findByIdAndDelete(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: "Offer hero slide not found" });
    }

    res.json({ message: "Offer hero slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
