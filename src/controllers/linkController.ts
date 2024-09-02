import { Request, Response } from 'express';
import shareLinkTemplate from '../tempelate/mail/shareLinkTempelate';
import mailSender from '../utils/mailSender';
import query from '../utils/query'; // Updated import

const getAllLinks = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { rows: links } = await query('SELECT * FROM links WHERE user_id = $1', [userId]);
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const addLink = async (req: any, res: Response): Promise<any> => {
  try {
    const { platform, link } = req.body;
    const userId = req.user?.id;

    if (!platform || !link) {
      return res.status(400).json({ message: "Platform and URL are required" });
    }

    await query(
      'INSERT INTO links (platform, link, user_id) VALUES ($1, $2, $3)',
      [platform, link, userId]
    );

    res.status(201).json({ message: "Link added successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateLink = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { platform, link } = req.body;
    const userId = req.user?.id;

    const { rows: linkInDb } = await query(
      'SELECT * FROM links WHERE link_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (linkInDb.length === 0) {
      return res.status(404).json({ message: "Link not found" });
    }

    await query(
      'UPDATE links SET platform = $1, link = $2 WHERE link_id = $3 AND user_id = $4',
      [platform || linkInDb[0].platform, link || linkInDb[0].link, id, userId]
    );

    res.status(200).json({ message: "Link updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteLink = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { rowCount } = await query(
      'DELETE FROM links WHERE link_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getLinksByUserId = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const { rows: links } = await query('SELECT * FROM links WHERE user_id = $1', [id]);

    if (links.length === 0) {
      return res.status(404).json({ message: "No links found for this user" });
    }

    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: "Error fetching links", error: error.message });
  }
};

const shareLink = async (req: any, res: Response): Promise<any> => {
  const { recipientEmail } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId || !recipientEmail) {
      return res.status(400).json({ message: "User ID and recipient email are required" });
    }

    // Find the user
    const { rows: userDetails } = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
    if (userDetails.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userDetails[0];

    // Find links associated with the user
    const { rows: links } = await query('SELECT * FROM links WHERE user_id = $1', [userId]);

    // Create email content
    const { name, email, profile_picture: profilePicture } = user;
    const subject = 'User Details';
    const body = shareLinkTemplate(name, email, profilePicture || '', links);

    // Send email
    const emailSent = await mailSender(recipientEmail, subject, body);

    return res.status(200).json({ message: "Email sent successfully", success: emailSent });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export {
  addLink,
  deleteLink,
  getAllLinks,
  getLinksByUserId, shareLink, updateLink
};

