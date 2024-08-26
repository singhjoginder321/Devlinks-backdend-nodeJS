const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const authenticateToken = require("../middleware/authMiddleware");
const {
  registerUser,
  uploadProfilePicture,
  loginUser,
  getUserDetails,
  getAllUsers,
  updateUserDetails,
  deleteUser,
} = require("../controllers/userController");

// Register a new user
router.post("/register", upload.single("profilePicture"), registerUser);

// Upload profile picture
router.post(
  "/upload-profile-picture",
  authenticateToken,
  upload.single("profilePicture"),
  uploadProfilePicture
);

// Login user
router.post("/login", loginUser);

// Get user details
router.get("/me", authenticateToken, getUserDetails);

// Get all users
router.get("/", getAllUsers);

// Update user details
router.put("/me", authenticateToken, updateUserDetails);

// Delete user
router.delete("/me", authenticateToken, deleteUser);

module.exports = router;
