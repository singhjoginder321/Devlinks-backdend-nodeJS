const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    // Log the MongoDB URI to confirm it's being read correctly
    // console.log("MongoDB URI:", process.env.MONGO_URI);

    // Check if URI is defined and valid
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment variables.");
    }

    // Connect to MongoDB without deprecated options
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected Successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
