import express, { NextFunction, Router,Request,Response} from 'express';
// import multer from 'multer';
import upload from '../config/multerConfig';
import { authenticateToken, loginUser, logoutUser, registerUser } from '../controllers/authController';
import { sendotp } from '../controllers/authController';
import {resetPassword} from '../controllers/authController';

const router: Router = express.Router();
//const upload: multer.Multer = multer(); // Adjust multer configuration as needed

// Registration route
router.post('/register', upload.single('profilePicture'), registerUser);

const log = (req:Request,res:Response,next:NextFunction) =>{
  console.log('Authentication middleware triggered');
  console.log(req);
  console.log(res);
  next();
  // Add your own authentication logic here
  // For example, you can check if the token is valid and authorized to access the route
}
// Login route
router.post('/login', log, loginUser);

// Logout route
router.post('/logout', logoutUser);

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp);

// Route for Changing the password
//router.post("/changepassword", auth, changePassword);

// Route for generating a reset password token
//router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

// Middleware to authenticate the user
router.use(authenticateToken);

export default router;
