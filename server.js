const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const lessonRoutes = require("./routes/lessonRoutes");

const connectDB =
  require("./config/db");


dotenv.config();

connectDB();
app.get("/api/db-test", async (req, res) => {
  const mongoose = require("mongoose");

  res.json({
    mongoUriExists: !!process.env.MONGO_URI,
    readyState: mongoose.connection.readyState
  });
});

const app =
  express();


/* Middleware */

app.use(
  cors()
);

app.use(
  express.json()
);


/* Test Route */

app.get(
  "/",
  (req, res) => {

    res.json({

      message:
        "LearnHub API is running",

      version:
        "1.0.0"

    });

  }
);


/* API Routes */

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
/* 404 */

app.use(
  (req, res) => {

    res.status(404).json({

      message:
        "API route not found."

    });

  }
);


/* Server */

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,
  () => {

    console.log(
      `LearnHub backend running on port ${PORT}`
    );

  }
);
