// backend/routes/auth.js
const express = require("express");
const { generateOTP, validateOTP } = require("../utils/otpService");
const { getDb } = require("../utils/db");
const router = express.Router();

// Ensure global in-memory storage exists
if (!global.userData) {
  global.userData = new Map();
}

/**
 * @route POST /auth/register
 * @desc Register user and send OTP
 * @body { name, email, class_status, phone }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, class_status, phone } = req.body;

    // Validation
    if (!name || !email || !class_status || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Generate unique user ID
    const userId = Date.now().toString(); // For in-memory, this is fine

    // Generate OTP
    const otp = generateOTP();

    const userDoc = {
      name,
      email,
      class_status,
      phone,
      otp,
      verified: false,
      createdAt: new Date(),
    };

    // Store in memory
    global.userData.set(userId, userDoc);

    // Store in DB (best-effort)
    try {
      const db = getDb();
      if (db) {
        await db.collection("users").insertOne({ _id: userId, ...userDoc });
      }
    } catch (e) {
      console.warn("DB insert user failed", e?.message);
    }

    // Simulate OTP sending (log to console)
    console.log(`OTP for ${phone} (User: ${name}): ${otp}`);

    res.json({
      message: "User registered successfully. OTP sent to phone/email.",
      userId,
      otp, // Keep for testing only; remove in production
    });
  } catch (error) {
    console.error("Register Error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

/**
 * @route POST /auth/verify-otp
 * @desc Verify OTP and mark user as verified
 * @body { userId, otp }
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = global.userData.get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (validateOTP(user.otp, otp)) {
      user.verified = true;
      global.userData.set(userId, user);
      try {
        const db = getDb();
        if (db) await db.collection("users").updateOne({ _id: userId }, { $set: { verified: true } });
      } catch (e) {
        console.warn("DB update verify failed", e?.message);
      }

      res.json({
        message: "OTP verified successfully",
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          class_status: user.class_status,
          phone: user.phone,
          verified: user.verified,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res
      .status(500)
      .json({ message: "OTP verification failed", error: error.message });
  }
});

/**
 * @route POST /auth/update-profile
 * @desc Update profile extras like academic stream, exams, experience, research papers (PG/PhD)
 * @body { userId, profile }
 */
router.post("/update-profile", async (req, res) => {
  try {
    const { userId, profile } = req.body;
    const user = global.userData.get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Merge provided structured fields
    const merged = {
      ...user,
      profile: {
        ...(user.profile || {}),
        ...profile,
      },
    };

    // If PG/PhD, allow researchPapers list
    if (profile && Array.isArray(profile.researchPapers)) {
      merged.profile.researchPapers = profile.researchPapers.slice(0, 50);
    }

    global.userData.set(userId, merged);
    // Best-effort DB persistence
    try {
      const db = getDb();
      if (db) await db.collection("users").updateOne({ _id: userId }, { $set: { profile: merged.profile } }, { upsert: true });
    } catch (e) {
      console.warn("DB update profile failed", e?.message);
    }
    res.json({ message: "Profile updated", user: { id: userId } });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

module.exports = router;
