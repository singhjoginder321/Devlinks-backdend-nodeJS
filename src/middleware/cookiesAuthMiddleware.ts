import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define the interface for the custom user object
interface CustomRequest extends Request {
  user?: JwtPayload | string; // Type for user property, based on your JWT payload
}

// Middleware to authenticate token from cookies
const authenticateTokenCookies = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): any => {
  // Extract the token from cookies
  const token = req.cookies.token;

  if (!token) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.JWT_SECRET as string, (err:any, user:any) => {
    if (err)  res.sendStatus(403); // Invalid token

    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

export default authenticateTokenCookies;
