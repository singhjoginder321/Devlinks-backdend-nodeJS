import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinaryConfig';
import query from '../utils/query'; // Updated import

const registerUser = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const { rows: existingUsers } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePictureUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "user_profiles" });
      profilePictureUrl = result.secure_url;
    }

    // Insert new user
    await query(
      'INSERT INTO users (name, email, password, profile_picture) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, profilePictureUrl]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const uploadProfilePicture = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { rows: users } = await query('SELECT * FROM users WHERE id = $1', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "user_profiles" });
      const profilePictureUrl = result.secure_url;

      await query(
        'UPDATE users SET profile_picture = $1 WHERE id = $2',
        [profilePictureUrl, userId]
      );

      res.status(200).json({
        message: "Profile picture uploaded successfully",
        profilePicture: profilePictureUrl,
      });
    } else {
      res.status(400).json({ message: "No file uploaded" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { rows: users } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    // console.log("user : " ,user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // console.log(user);
    const accessToken = jwt.sign(
      { id: user.id, username: user.name },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getUserDetails = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    // console.log(req);
    // console.log(req.user);
    console.log(userId);
    const { rows: users } = await query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const { password, ...userDetails } = user; // Exclude password from response

    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllUsers = async (res: Response): Promise<any> => {
  try {
    const { rows: users } = await query('SELECT user_id, name, email, profile_picture FROM users');
    res.status(200).json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateUserDetails = async (req: any, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user?.id;

    const { rows: users } = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await query(
      'UPDATE users SET name = $1, email = $2, password = $3 WHERE user_id = $4',
      [user.name, user.email, user.password, userId]
    );

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteUser = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    const { rowCount } = await query('DELETE FROM users WHERE user_id = $1', [userId]);

    if (rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export {
  deleteUser, getAllUsers, getUserDetails, loginUser, registerUser, updateUserDetails, uploadProfilePicture
};

