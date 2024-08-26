const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinaryConfig");
const generateToken = require("../utils/generateToken");

require("dotenv").config();

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);

  try {
    // Check for missing fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile picture upload to Cloudinary
    let profilePictureUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_profiles",
      });
      profilePictureUrl = result.secure_url;
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePicture: profilePictureUrl, // Store the Cloudinary URL
    });

    // Save the user
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token using the utility function
    const token = generateToken(user);
    // Set the JWT token in a cookie

    res.cookie("token", token, {
      httpOnly: true, // Helps to prevent XSS attacks
      secure: process.env.NODE_ENV === "production", // Set to true in production to use HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
      sameSite: "strict", // Helps to prevent CSRF attacks
      credentials: true,
    });

    res.status(200).json({ message: "Logged In Successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//Logout Controller
const logoutUser = (req, res) => {
  // Clear the JWT token cookie
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    maxAge: 0, // Immediately expire the cookie
    sameSite: "strict", // Prevent CSRF attacks
  });

  // Send a response indicating that the logout was successful
  res.status(200).json({
    message: "Logged out successfully",
  });
};

module.exports = logoutUser;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authenticateToken,
};
