import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// CREATE PRODUCT
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET ALL PRODUCTS (with pagination)
// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const products = await Product.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
    
//     const total = await Product.countDocuments();
    
//     res.json({
//       products,
//       pagination: {
//         current: page,
//         pages: Math.ceil(total / limit),
//         total
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get("/", async (req, res) => {
  console.log("Receiving datas");

  try {
    const dummyProducts = [
      {
        _id: "1",
        name: "iPhone 15",
        price: 79999,
        category: "Mobiles",
        image: "https://via.placeholder.com/300",
        stock: 10,
      },
      {
        _id: "2",
        name: "Samsung Galaxy S24",
        price: 69999,
        category: "Mobiles",
        image: "https://via.placeholder.com/300",
        stock: 15,
      },
      {
        _id: "3",
        name: "MacBook Air M3",
        price: 119999,
        category: "Laptops",
        image: "https://via.placeholder.com/300",
        stock: 5,
      },
    ];

    res.json({
      products: dummyProducts,
      pagination: {
        current: 1,
        pages: 1,
        total: dummyProducts.length,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
