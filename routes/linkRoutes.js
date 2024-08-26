const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  getAllLinks,
  addLink,
  updateLink,
  deleteLink,
  getLinksByUserId,
} = require("../controllers/linkController");

// Get all links for the authenticated user
router.get("/", authenticateToken, getAllLinks);

//Get link with LinkID
router.get("/:id", authenticateToken, getLinksByUserId);
// Add a new link
router.post("/", authenticateToken, addLink);

// Update a link
router.put("/:id", authenticateToken, updateLink);

// Delete a link
router.delete("/:id", authenticateToken, deleteLink);

module.exports = router;
