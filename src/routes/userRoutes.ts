import express, { Request, Response } from "express";
import upload from "../config/multerConfig";
import {
  deleteUser,
  getAllUsers,
  getUserDetails,
  loginUser,
  registerUser,
  updateUserDetails,
  uploadProfilePicture,
} from "../controllers/userController";
import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

// Register a new user
router.post(
  "/register",
  upload.single("profilePicture"),
  (req: Request, res: Response) => {
    registerUser(req, res);
  }
);

// Upload profile picture
router.post(
  "/upload-profile-picture",
  authenticateToken,
  upload.single("profilePicture"),
  (req: Request, res: Response) => {
    uploadProfilePicture(req, res);
  }
);

// Login user
router.post("/login", (req: Request, res: Response) => {
  loginUser(req, res);
});
// Get user details
router.get("/me", authenticateToken, (req: Request, res: Response) => {
  getUserDetails(req, res);
});

// Get all users
router.get("/", ( _req : Request, res: Response ) => { 
  getAllUsers(res);
});

// Update user details
router.put("/me", authenticateToken, (req: Request, res: Response) => {
  updateUserDetails(req, res);
});

// Delete user
router.delete("/me", authenticateToken, (req: Request, res: Response) => {
  deleteUser(req, res);
});

export default router;
