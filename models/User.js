const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

// Define the User schema
// models/User.js

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: { type: String },
  password: {
    type: String,
    required: true,
  },
  // Add any additional fields if needed
});

// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
