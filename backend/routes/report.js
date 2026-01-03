// backend/routes/report.js
const express = require("express");
const {
  generateCareerReport,
  getScholarshipOptions,
  getCollegeRecommendations,
} = require("../utils/reportService");
const router = express.Router();
const { getDb } = require("../utils/db");

// Ensure global maps exist
if (!global.userData) global.userData = new Map();
if (!global.testResponses) global.testResponses = new Map();

/**
 * @route GET /report/career-guidance/:userId
 * @desc Generate career guidance report based on user profile and test results
 */
router.get("/career-guidance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let user = global.userData.get(userId);
    let testResponse = global.testResponses.get(userId);

    // Attempt DB fetch if missing in memory
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

    // If test not completed, send empty report
    const reportData = testResponse || {
      careerSuggestion: [],
      answers: {},
    };

    const report = generateCareerReport(user, reportData);
    const colleges = getCollegeRecommendations({ ...user, careerSuggestion: reportData.careerSuggestion });

    res.json({
      message: "Career guidance report generated successfully",
      report,
      colleges,
    });
  } catch (error) {
    console.error("Career Report Error:", error);
    res.status(500).json({
      message: "Failed to generate report",
      error: error.message,
    });
  }
});

/**
 * @route GET /report/scholarships/:userId
 * @desc Fetch dynamic scholarship options based on user profile
 */
router.get("/scholarships/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    const user = global.userData.get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const scholarships = getScholarshipOptions(user);

    res.json({
      message: "Scholarship options fetched successfully",
      scholarships,
    });
  } catch (error) {
    console.error("Scholarship Fetch Error:", error);
    res.status(500).json({
      message: "Failed to fetch scholarships",
      error: error.message,
    });
  }
});

module.exports = router;
