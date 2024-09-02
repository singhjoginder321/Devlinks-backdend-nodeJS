import bcrypt from 'bcrypt';
import crypto from 'crypto'; // To generate a token
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import cloudinary from '../config/cloudinaryConfig';
import emailVerificationTemplate from '../tempelate/mail/emailVerificationTemplate';
import generateToken from '../utils/generateToken';
import mailSender from '../utils/mailSender';
import query from '../utils/query'; // Updated import

dotenv.config();

interface CustomRequest extends Request {
  file?: Express.Multer.File; // Include file if using file uploads
  user?: any; // User information will be added by authentication middleware
}

const registerUser = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, otp } = req.body;

  try {
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "Name, email, password, and OTP are required" });
    }

    // Verify OTP
    const { rows: otpRecords } = await query('SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1', [email]);
    const otpRecord = otpRecords[0];
    if (!otpRecord || otp !== otpRecord.otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Remove OTP record once verified
    await query('DELETE FROM otps WHERE email = $1', [email]);

    // Check if user already exists
    const { rows: existingUsers } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile picture upload to Cloudinary
    let profilePictureUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "user_profiles" });
      profilePictureUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // Clean up local file
    }

    // Create a new user
    const { rows: newUsers } = await query(
      'INSERT INTO users (name, email, password, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, profilePictureUrl]
    );
    const newUser = newUsers[0];

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const { rows: users } = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = users[0];
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials - user doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials - password do not match" });
    }
    console.log(user);
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged In Successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const logoutUser = (res: Response): void => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction): any => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET!, (err, user): any => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const sendotp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email }: { email: string } = req.body;

    const { rows: existingUsers } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUsers.length > 0) {
      return res.status(401).json({ success: false, message: `User is Already Registered` });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let { rows: otpRecords } = await query('SELECT * FROM otps WHERE otp = $1', [otp]);
    while (otpRecords.length > 0) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      ({ rows: otpRecords } = await query('SELECT * FROM otps WHERE otp = $1', [otp]));
    }

    const otpPayload = { email, otp };
    await query('INSERT INTO otps (email, otp) VALUES ($1, $2)', [email, otp]);

    const emailBody = emailVerificationTemplate(otp);
    await mailSender(email, 'Your OTP Code', emailBody);

    return res.status(200).json({ success: true, message: `OTP Sent Successfully`, otp });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const { rows: users } = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    await query('UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3', [resetToken, Date.now() + 3600000, email]);

    const resetLink = `https://your-app-url/reset-password/${resetToken}`;

    const subject = 'Password Reset Request';
    const body = `
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thanks,</p>
      <p>Your App Team</p>
    `;

    await mailSender(email, subject, body);

    return res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export {
  authenticateToken,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  sendotp
};

