import { Request, Response } from 'express';
import Link from '../models/Link';
import User from '../models/User';
import shareLinkTemplate from '../tempelate/mail/shareLinkTempelate';
import mailSender from '../utils/mailSender';
// import { any } from '../middleware/authMiddleware'; // Import the any interface if you have it

const getAllLinks = async (req: any, res: Response): Promise<any> => {
  try {
    const links = await Link.find({ userId: req.user?.id });
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const addLink = async (req: any, res: Response): Promise<any> => {
  try {
    const { platform, link } = req.body;

    if (!platform || !link) {
      return res.status(400).json({ message: "Platform and URL are required" });
    }

    // Debugging: log request body
    console.log("Request Body:", req.body);
    console.log("User ID:", req.user);

    const newLink = new Link({
      platform,
      link,
      userId: req.user?.id, // Assuming user is authenticated and user ID is available
    });

    await newLink.save();
    res.status(201).json({ message: "Link added successfully" });
  } catch (error) {
    // Log detailed error information
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateLink = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { platform, link } = req.body;

    const linkInDb = await Link.findOne({ _id: id, userId: req.user?.id });
    if (!linkInDb) {
      return res.status(404).json({ message: "Link not found" });
    }

    linkInDb.platform = platform || linkInDb.platform;
    linkInDb.link = link || linkInDb.link;

    await linkInDb.save();
    res.status(200).json(linkInDb);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteLink = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const link = await Link.findOneAndDelete({ _id: id, userId: req.user?.id });
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all links by userId from the request params
const getLinksByUserId = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // Extract the link ID from the request parameters
    console.log(id);

    // Fetch the link associated with the linkId
    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    // Return the link as a response
    res.status(200).json(link);
  } catch (error:any) {
    res.status(500).json({ message: "Error fetching link", error: error.message });
  }
};


const shareLink = async (req: any, res: Response): Promise<any> => {
  const { recipientEmail } = req.body;
  const userId = req.user?.id;
  console.log(req.body);
  console.log(userId, recipientEmail);

  try {
    // Validate input
    if (!userId || !recipientEmail) {
      return res.status(400).json({ message: "User ID and recipient email are required" });
    }

    // Find the user
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find links associated with the user
    const links = await Link.find({ userId });

    // Create email content
    const { name, email, profilePicture } = userDetails;
    const subject = 'User Details';
    const body = shareLinkTemplate(name, email, profilePicture || '', links);

    // Send email
    const emailSent = await mailSender(recipientEmail, subject, body);

    return res.status(200).json({ message: "Email sent successfully", success: emailSent});
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export {
  addLink, deleteLink, getAllLinks, getLinksByUserId, updateLink, shareLink
};
