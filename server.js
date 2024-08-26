// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const linkRoutes = require("./routes/linkRoutes");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
require("dotenv").config();
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");

// Initialize Express app
const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.send("Hello, World!");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/auth", authRoutes);

app.get("/error", (req, res) => {
  try {
    throw new Error("An intentional error");
  } catch (error) {
    logger.error("Error on /error route: " + error.message);
    logger.error(
      `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
    res.status(500).send("Something went wrong!");
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
