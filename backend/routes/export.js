// backend/routes/export.js
const express = require("express");
const { generateExcel } = require("../utils/excelGenerator"); // corrected filename
const { getDb } = require("../utils/db");
const router = express.Router();

// Ensure global maps exist
if (!global.userData) global.userData = new Map();
if (!global.testResponses) global.testResponses = new Map();

/**
 * @route GET /export/excel/:userId
 * @desc Export user data + test responses as Excel
 */
router.get("/excel/:userId", async (req, res) => {
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

    // If test not taken, return empty object instead of failing
    const responses = testResponse || {};

    const excelBuffer = await generateExcel(user, responses);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Career_Research_Assessment.xlsx"`
    );

    res.send(excelBuffer);
  } catch (error) {
    console.error("Excel Export Error:", error);
    res.status(500).json({
      message: "Failed to generate Excel file",
      error: error.message,
    });
  }
});

module.exports = router;
