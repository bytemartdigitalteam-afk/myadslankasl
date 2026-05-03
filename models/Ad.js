const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    paymentSlip: {
      type: String, // Store payment slip image URL/path
    },
    images: [
      {
        type: String, // Store image URLs or file paths
      },
    ],
    isVIP: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    level: {
      type: String,
      enum: ['normal', 'verified', 'vip', 'vvip', 'fake'],
      default: 'normal'
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adType: {
      type: String,
      enum: ['general', 'product'],
      default: 'general'
    },
    stockStatus: {
      type: String,
      enum: ['in-stock', 'sold-out'],
      default: 'in-stock'
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", adSchema);
