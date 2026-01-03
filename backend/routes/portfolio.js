// backend/routes/portfolio.js
const express = require("express");
const { generatePDF } = require("../utils/pdfGenerator");
const { getDb } = require("../utils/db");
const router = express.Router();

// Ensure global in-memory storage exists
if (!global.userData) global.userData = new Map();
if (!global.testResponses) global.testResponses = new Map();

/**
 * @route GET /portfolio/generate/:userId
 * @desc Generate portfolio PDF for download
 */
router.get("/generate/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let user = global.userData.get(userId);
    let testResponse = global.testResponses.get(userId);

    if (!user) {
      try {
        const db = getDb();
        if (db) user = await db.collection("users").findOne({ _id: userId });
      } catch {}
    }
    if (!testResponse) {
      try {
        const db = getDb();
        if (db) testResponse = await db.collection("testResponses").findOne({ _id: userId });
      } catch {}
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If test not completed, send empty data
    const responses = testResponse || { careerSuggestion: [], answers: {} };

    const pdfBuffer = await generatePDF(user, responses);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Career_Research_Assessment.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Portfolio PDF Error:", error);
    res.status(500).json({
      message: "Failed to generate portfolio",
      error: error.message,
    });
  }
});

/**
 * @route GET /portfolio/data/:userId
 * @desc Fetch portfolio data for online view
 */
router.get("/data/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let user = global.userData.get(userId);
    let testResponse = global.testResponses.get(userId);

    if (!user) {
      try {
        const db = getDb();
        if (db) user = await db.collection("users").findOne({ _id: userId });
      } catch {}
    }
    if (!testResponse) {
      try {
        const db = getDb();
        if (db) testResponse = await db.collection("testResponses").findOne({ _id: userId });
      } catch {}
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If test not completed, send empty suggestions
    const careerSuggestion = testResponse?.careerSuggestion || [];
    const answers = testResponse?.answers || {};

    const portfolioData = {
      personalInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        class_status: user.class_status,
      },
      careerSuggestion,
      testResults: answers,
      generatedAt: new Date(),
    };

    res.json({
      message: "Portfolio data fetched successfully",
      portfolio: portfolioData,
    });
  } catch (error) {
    console.error("Portfolio Data Error:", error);
    res.status(500).json({
      message: "Failed to fetch portfolio data",
      error: error.message,
    });
  }
});

module.exports = router;
