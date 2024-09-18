import express, { NextFunction, Request, Response, Router } from 'express';
// import multer from 'multer';
import passport from 'passport';
import upload from '../config/multerConfig';
import { authenticateToken, loginUser, logoutUser, registerUser, resetPassword, sendotp } from '../controllers/authController';
import generateToken from '../utils/generateToken';

const router: Router = express.Router();
//const upload: multer.Multer = multer(); // Adjust multer configuration as needed

// Registration route
router.post('/register', upload.single('profilePicture'), registerUser);

const log = (req:Request,res:Response,next:NextFunction) =>{
  console.log('Authentication middleware triggered');
  // console.log(req);
  // console.log(res);
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
// Google OAuth
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback', async (req, res, next) => {
  passport.authenticate('google', { session: false }, async (error, user, info) => {
    if (error || !user) {
      return res.redirect('http://localhost:5173/login-signup'); // Handle failure
    }

    // Generate the JWT token
    const token = generateToken(user);

    // Send the token to the frontend
    return res.redirect(`http://localhost:5173/Oauth?token=${token}`);
  })(req, res, next);
});


// GitHub OAuth
router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email']
  })
);

router.get('/github/callback', async (req, res, next) => {
  passport.authenticate('github', { session: false }, async (error:any, user:any, info:any) => {
    if (error || !user) {
      return res.redirect('http://localhost:5173/login-signup'); // Handle failure
    }

    // Generate the JWT token
    const token = generateToken(user);

    // Send the token to the frontend
    return res.redirect(`http://localhost:5173/Oauth?token=${token}`);
  })(req, res, next);
});


// Middleware to authenticate the user
router.use(authenticateToken);

export default router;
