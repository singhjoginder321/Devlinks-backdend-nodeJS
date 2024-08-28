import express, { Request, Response } from "express";
import authenticateToken from "../middleware/authMiddleware";
import {
  getAllLinks,
  addLink,
  updateLink,
  deleteLink,
  getLinksByUserId,
  shareLink
} from "../controllers/linkController";

const router = express.Router();

// Get all links for the authenticated user
router.get("/", authenticateToken, (req: Request, res: Response ) => {
  getAllLinks(req, res);
});

// Get link with LinkID
router.get("/:id", authenticateToken, (req: Request, res: Response ) => {
  getLinksByUserId(req, res);
});

// Add a new link
router.post("/", authenticateToken, (req: Request, res: Response ) => {
  addLink(req, res);
});

// Update a link
router.put("/:id", authenticateToken, (req: Request, res: Response ) => {
  updateLink(req, res );
});

// Delete a link
router.delete("/:id", authenticateToken, (req: Request, res: Response ) => {
  deleteLink(req, res );
});

router.post("/shareLink", authenticateToken, (req: Request, res: Response ) => {
  shareLink(req, res );
});
export default router;
