import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator'; // Assuming you have this package installed
import cloudinary from '../config/cloudinaryConfig';
import User from '../models/User';
import generateToken from '../utils/generateToken';
//import User from '../models/User'; // Adjust the import path as necessary
import crypto from 'crypto'; // To generate a token
import OTP from '../models/OTP'; // Adjust the import path as necessary
import emailVerificationTemplate from '../tempelate/mail/emailVerificationTemplate';
import mailSender from '../utils/mailSender';

dotenv.config();

interface CustomRequest extends Request {
  file?: Express.Multer.File; // Include file if using file uploads
  user?: any; // User information will be added by authentication middleware
}



const registerUser = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, otp } = req.body;

  try {
    // Check for missing fields
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "Name, email, password, and OTP are required" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord || otp !== otpRecord.otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Optionally, remove the OTP record once verified
    await OTP.deleteOne({ email });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile picture upload to Cloudinary
    let profilePictureUrl = "";
    if (req.file) {
      // req.file = req.file;
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_profiles",
      });
      profilePictureUrl = result.secure_url;
      
      // Clean up the local file after uploading to Cloudinary
      fs.unlinkSync(req.file.path);
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePicture: profilePictureUrl, // Store the Cloudinary URL
    });

    // Save the user
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // console.log(req.body);

    // Check if user exists
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials - user doesn't exist" });
    }
    // console.log(user);
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(password);
    console.log(user.password);
    // console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials - password do not match" });
    }

    // Generate JWT token using the utility function
    const token = generateToken(user);

    // Set the JWT token in a cookie
    res.cookie("token", token, {
      httpOnly: true, // Helps to prevent XSS attacks
      secure: process.env.NODE_ENV === "production", // Set to true in production to use HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
      sameSite: "strict", // Helps to prevent CSRF attacks
    });

    res.status(200).json({ message: "Logged In Successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const logoutUser = (res: Response): void => {
  // Clear the JWT token cookie
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    maxAge: 0, // Immediately expire the cookie
    sameSite: "strict", // Prevent CSRF attacks
  });

  // Send a response indicating that the logout was successful
  res.status(200).json({
    message: "Logged out successfully",
  });
};

const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction): any => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET!, (err, user):any => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};



const sendotp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email }: { email: string } = req.body;

    // Check if user is already present
    const checkUserPresent = await User.findOne({ email });

    // If user found with provided email
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp });
    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", result);

    // Ensure OTP is unique
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp });
    }

    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);

    const emailBody = emailVerificationTemplate(otp);

    // Send email
    const Finalresult = await mailSender(
      email,
      'Your OTP Code',
      emailBody
    );

    return res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
      Finalresult
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email',
      });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Store the reset token and expiration in the database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Generate password reset link
    const resetLink = `https://your-app-url/reset-password/${resetToken}`;

    // Set up email content
    const subject = 'Password Reset Request';
    const body = `
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thanks,</p>
      <p>Your App Team</p>
    `;

    // Send the password reset email
    await mailSender(email, subject, body);

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}
export {
  authenticateToken, loginUser,
  logoutUser, registerUser, resetPassword, sendotp
};

