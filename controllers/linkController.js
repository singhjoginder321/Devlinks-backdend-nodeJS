const Link = require("../models/Link");

const getAllLinks = async (req, res) => {
  try {
    const links = await Link.find({ userId: req.user.id });
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const addLink = async (req, res) => {
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
      userId: req.user.id, // Assuming user is authenticated and user ID is available
    });

    await newLink.save();
    res.status(201).json({ message: "Link added successfully" });
  } catch (error) {
    // Log detailed error information
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, link } = req.body;

    const linkInDb = await Link.findOne({ _id: id, userId: req.user.id });
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

const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all links by userId from the request params
const getLinksByUserId = async (req, res) => {
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
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching link", error: error.message });
  }
};
module.exports = {
  getAllLinks,
  addLink,
  updateLink,
  deleteLink,
  getLinksByUserId,
};
