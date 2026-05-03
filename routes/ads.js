const express = require("express");
const router = express.Router();
const Ad = require("../models/Ad");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/multer");

// @route   GET /api/ads
// @desc    Get all ads (with optional search/filter)
router.get("/", async (req, res) => {
  try {
    const { keyword, category, location } = req.query;

    let query = { status: 'approved' };

    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = location;
    }

    const ads = await Ad.find(query).sort({ isVIP: -1, createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/ads/myads
// @desc    Get user's own ads
router.get("/myads", protect, async (req, res) => {
  try {
    const ads = await Ad.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/ads/:id
// @desc    Get single ad
router.get("/:id", async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate("user", "name email");
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    
    // Increment views
    ad.views = (ad.views || 0) + 1;
    await ad.save();
    
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/ads
// @desc    Create an ad
router.post("/", protect, upload.fields([{ name: "images", maxCount: 5 }, { name: "paymentSlip", maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description, price, category, location, contactNumber, isVIP, adType } = req.body;

    const imagePaths = req.files && req.files.images
      ? req.files.images.map((file) => `uploads/${file.filename}`)
      : [];
      
    const paymentSlipPath = req.files && req.files.paymentSlip && req.files.paymentSlip.length > 0
      ? `uploads/${req.files.paymentSlip[0].filename}`
      : "";

    const ad = new Ad({
      title,
      description,
      price,
      category,
      location,
      contactNumber,
      images: imagePaths,
      paymentSlip: paymentSlipPath,
      isVIP: isVIP === "true" || isVIP === true,
      adType: adType || 'general',
      user: req.user.id,
    });

    const createdAd = await ad.save();
    res.status(201).json(createdAd);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/ads/:id/stock
// @desc    Update ad stock status (in-stock or sold-out)
router.put("/:id/stock", protect, async (req, res) => {
  try {
    const { stockStatus } = req.body;
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    if (ad.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    ad.stockStatus = stockStatus;
    const updatedAd = await ad.save();
    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/ads/:id
// @desc    Update an ad
router.put("/:id", protect, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) return res.status(404).json({ message: "Ad not found" });

    // Ensure user owns the ad or is an admin
    if (ad.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized to update this ad" });
    }

    const updatedAd = await Ad.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/ads/:id
// @desc    Delete an ad
router.delete("/:id", protect, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) return res.status(404).json({ message: "Ad not found" });

    // Ensure user owns the ad or is an admin
    if (ad.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized to delete this ad" });
    }

    await ad.deleteOne();
    res.json({ message: "Ad removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
