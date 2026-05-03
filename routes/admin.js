const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Ad = require("../models/Ad");
const Agent = require("../models/Agent");
const { protect, admin } = require("../middleware/auth");
const upload = require("../middleware/multer");

// @route   PUT /api/admin/change-password
// @desc    Change admin password
router.put("/change-password", protect, admin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "Password is required" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAds = await Ad.countDocuments();
    const pendingAds = await Ad.countDocuments({ status: "pending" });
    const approvedAds = await Ad.countDocuments({ status: "approved" });

    res.json({ totalUsers, totalAds, pendingAds, approvedAds });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/admin/ads
// @desc    Get all ads for admin (including pending)
router.get("/ads", protect, admin, async (req, res) => {
  try {
    const ads = await Ad.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/ads/:id/status
// @desc    Approve or Reject an ad
router.put("/ads/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ad = await Ad.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/ads/:id/level
// @desc    Change ad level (normal, verified, vip, vvip)
router.put("/ads/:id/level", protect, admin, async (req, res) => {
  try {
    const { level } = req.body;
    if (!["normal", "verified", "vip", "vvip"].includes(level)) {
      return res.status(400).json({ message: "Invalid level" });
    }

    const isVIP = ["vip", "vvip"].includes(level);
    
    const ad = await Ad.findByIdAndUpdate(req.params.id, { level, isVIP }, { new: true });
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/admin/ads/:id
// @desc    Delete any ad
router.delete("/ads/:id", protect, admin, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    await ad.deleteOne();
    res.json({ message: "Ad removed by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/admin/agents
// @desc    Add a new Ad Agent
router.post("/agents", protect, admin, upload.single("logo"), async (req, res) => {
  try {
    const { name, whatsapp } = req.body;
    const logoUrl = req.file ? req.file.path : "";

    const agent = new Agent({ name, whatsapp, logoUrl });
    await agent.save();

    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/admin/agents
// @desc    Get all Ad Agents
router.get("/agents", async (req, res) => {
  try {
    const agents = await Agent.find({});
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/agents/:id
// @desc    Update an Ad Agent
router.put("/agents/:id", protect, admin, upload.single("logo"), async (req, res) => {
  try {
    const { name, whatsapp } = req.body;
    let updateData = { name, whatsapp };
    
    if (req.file) {
      updateData.logoUrl = req.file.path;
    }

    const agent = await Agent.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/admin/agents/:id
// @desc    Delete an Ad Agent
router.delete("/agents/:id", protect, admin, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    await agent.deleteOne();
    res.json({ message: "Agent removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

const Category = require("../models/Category");

// @route   GET /api/admin/categories
// @desc    Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/admin/categories
// @desc    Add a new category
router.post("/categories", protect, admin, async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    
    const category = new Category({ name, icon: icon || 'tag' });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "Category already exists" });
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete a category
router.delete("/categories/:id", protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    
    await category.deleteOne();
    res.json({ message: "Category removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/ads/:id/metrics
// @desc    Update ad metrics manually (views, likes)
router.put("/ads/:id/metrics", protect, admin, async (req, res) => {
  try {
    const { views, likes } = req.body;
    
    let updateFields = {};
    if (views !== undefined) updateFields.views = parseInt(views);
    if (likes !== undefined) updateFields.likes = parseInt(likes);
    
    const ad = await Ad.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

const VerificationRequest = require("../models/VerificationRequest");

// @route   GET /api/admin/verifications
// @desc    Get all verification requests
router.get("/verifications", protect, admin, async (req, res) => {
  try {
    const verifications = await VerificationRequest.find({}).populate("user", "name email isVerified verificationStatus").sort({ createdAt: -1 });
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/verifications/:id/status
// @desc    Approve or reject verification request
router.put("/verifications/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const verification = await VerificationRequest.findById(req.params.id);
    
    if (!verification) return res.status(404).json({ message: "Verification not found" });

    verification.status = status;
    await verification.save();

    const user = await User.findById(verification.user);
    if (user) {
      if (status === 'approved') {
        user.isVerified = true;
        user.verificationStatus = 'verified';
      } else if (status === 'rejected') {
        user.isVerified = false;
        user.verificationStatus = 'rejected';
      }
      await user.save();
    }

    res.json(verification);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
