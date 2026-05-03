const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register error:", error.message, error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate a user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Login attempt for:", normalizedEmail);

    // Check for user email
    const user = await User.findOne({ email: normalizedEmail });
    console.log("User found:", !!user);

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (isMatch) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error.message, error.stack);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// @route   GET /api/auth/me
// @desc    Get user data
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

const VerificationRequest = require("../models/VerificationRequest");
const upload = require("../middleware/multer");

// @route   POST /api/auth/verify
// @desc    Submit verification request
router.post("/verify", protect, upload.fields([{ name: "images", maxCount: 2 }, { name: "paymentSlip", maxCount: 1 }]), async (req, res) => {
  try {
    const { fullName, location, gender, birthday } = req.body;
    
    // Check if user already submitted
    const user = await User.findById(req.user.id);
    if (user.verificationStatus === 'pending') {
      return res.status(400).json({ message: "Verification already pending" });
    }
    if (user.verificationStatus === 'verified' || user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const imagePaths = req.files && req.files.images
      ? req.files.images.map((file) => `uploads/${file.filename}`)
      : [];
      
    const paymentSlipPath = req.files && req.files.paymentSlip && req.files.paymentSlip.length > 0
      ? `uploads/${req.files.paymentSlip[0].filename}`
      : "";

    if (imagePaths.length < 2 || !paymentSlipPath) {
      return res.status(400).json({ message: "Please upload 2 images and a payment slip" });
    }

    const verificationReq = new VerificationRequest({
      user: req.user.id,
      fullName,
      location,
      gender,
      birthday,
      images: imagePaths,
      paymentSlip: paymentSlipPath
    });

    await verificationReq.save();
    
    user.verificationStatus = 'pending';
    await user.save();

    res.status(201).json({ message: "Verification submitted successfully" });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
