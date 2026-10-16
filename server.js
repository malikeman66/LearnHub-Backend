const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: [
      "https://learn-hub-frontend-theta.vercel.app",
      "https://learnhub.bonto.run",
      "http://localhost:5173"
    ],
    credentials: true
  })
);

app.use(express.json());

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.json({
    message: "LearnHub API is running",
    version: "1.0.0"
  });
});

/* =========================
   DATABASE TEST
========================= */
app.get("/api/db-test", async (req, res) => {
  try {
    await connectDB();
    res.json({
      mongoUriExists: true,
      mongoConnectionState: mongoose.connection.readyState,
      message: "MongoDB connected"
    });
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    res.status(503).json({
      mongoUriExists: Boolean(process.env.MONGO_URI),
      mongoConnectionState: mongoose.connection.readyState,
      message: "MongoDB not connected"
    });
  }
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    res.status(503).json({
      message: "Database unavailable."
    });
  }
});

/* =========================
   API ROUTES
========================= */

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api",
  require("./routes/publicRoutes")
);

app.use(
  "/api/courses",
  require("./routes/courseRoutes")
);

app.use(
  "/api",
  require("./routes/enrollmentRoutes")
);

app.use(
  "/api/admin",
  require("./routes/adminRoutes")
);

app.use(
  "/api/lessons",
  require("./routes/lessonRoutes")
);

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found."
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message
  });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LearnHub backend running on port ${PORT}`);
});
