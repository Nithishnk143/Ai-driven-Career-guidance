// backend/server.js
require("dotenv").config(); // Load .env variables

const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // optional logging

const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/test");
const reportRoutes = require("./routes/report");
const portfolioRoutes = require("./routes/portfolio");
const exportRoutes = require("./routes/export");
const { connectToDatabase } = require("./utils/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // logs incoming requests

// In-memory storage
global.userData = new Map(); // Stores user details
global.testResponses = new Map(); // Stores psychometric test responses

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/export", exportRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "Career Counselling API is running!" });
});

// DB health check
app.get("/api/health/db", async (req, res) => {
  try {
    const { getDb, connectToDatabase } = require("./utils/db");
    let db = getDb();
    if (!db) {
      try {
        db = await connectToDatabase();
      } catch (e) {
        return res.status(200).json({ connected: false, message: "DB connection attempt failed", error: e?.message });
      }
    }
    if (!db) return res.status(200).json({ connected: false, message: "DB not initialized (using in-memory)." });
    await db.command({ ping: 1 });
    res.status(200).json({ connected: true });
  } catch (err) {
    res.status(200).json({ connected: false, error: err?.message });
  }
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Process-level error guards to avoid terminal crash
process.on("unhandledRejection", (reason) => {
  console.warn("[Process] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Process] Uncaught Exception:", err);
});

// Start server and connect DB
(async () => {
  try {
    const db = await connectToDatabase();
    if (db) {
      global.storageMode = "db";
    } else {
      global.storageMode = "memory";
    }
  } catch (err) {
    console.warn("Database connection failed, continuing with in-memory store only.", err?.message);
    global.storageMode = "memory";
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`[Storage] Mode: ${global.storageMode || 'memory'}`);
  });
})();
