import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

dotenv.config();

// Define the interface for the custom user object
export interface CustomRequest extends Request {
  user?: JwtPayload | string; // Type for user property, based on your JWT payload
}

// Middleware to authenticate token from authorization header
const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): any => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer [token]'
  // console.log(token);
  if (!token) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user):any => {
    if (err) return res.sendStatus(403); // Invalid token

    // console.log('User from JWT:', user);
    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

export default authenticateToken;
