const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const {
  registerUser,
  loginUser,
  authenticateToken,
  logoutUser,
} = require("../controllers/authController");

// Registration route
router.post("/register", upload.single("profilePicture"), registerUser);

// Login route
router.post("/login", loginUser);

//Logout route
router.post("/logout", logoutUser);

// Middleware to authenticate the user
router.use(authenticateToken);

module.exports = router;
