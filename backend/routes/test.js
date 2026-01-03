// backend/routes/test.js
const express = require("express");
const {
  psychometricQuestions,
  calculateCareerSuggestion,
} = require("../utils/testService");
const router = express.Router();
const { getDb } = require("../utils/db");

// Ensure global maps exist
if (!global.userData) global.userData = new Map();
if (!global.testResponses) global.testResponses = new Map();

/**
 * @route GET /test/questions
 * @desc Fetch all psychometric questions (multiple-choice)
 */
router.get("/questions", (req, res) => {
  try {
    res.json({ questions: psychometricQuestions });
  } catch (error) {
    console.error("Fetch Questions Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch questions", error: error.message });
  }
});

/**
 * @route POST /test/submit
 * @desc Submit answers and calculate career suggestion
 * @body { userId, answers }
 */
router.post("/submit", async (req, res) => {
  try {
    const { userId, answers } = req.body;

    const user = global.userData.get(userId);
    if (!user || !user.verified) {
      return res
        .status(401)
        .json({ message: "User not found or not verified" });
    }

    // Calculate career suggestions dynamically based on answers
    const careerSuggestion = calculateCareerSuggestion(answers);

    // Store test responses in memory
    const resultDoc = {
      answers,
      submittedAt: new Date(),
      careerSuggestion,
    };
    global.testResponses.set(userId, resultDoc);

    // Persist to DB when available
    try {
      const db = getDb();
      if (db) {
        await db.collection("testResponses").updateOne(
          { _id: userId },
          { $set: { ...resultDoc, userId } },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn("DB save testResponses failed", e?.message);
    }

    res.json({
      message: "Test submitted successfully",
      careerSuggestion,
    });
  } catch (error) {
    console.error("Test Submission Error:", error);
    res
      .status(500)
      .json({ message: "Test submission failed", error: error.message });
  }
});

/**
 * @route GET /test/results/:userId
 * @desc Fetch submitted test results
 */
router.get("/results/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    const user = global.userData.get(userId);
    const testResponse = global.testResponses.get(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!testResponse) {
      return res.status(404).json({ message: "Test results not found" });
    }

    res.json({
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        class_status: user.class_status,
      },
      results: testResponse,
    });
  } catch (error) {
    console.error("Fetch Test Results Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch results", error: error.message });
  }
});

module.exports = router;
