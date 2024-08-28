import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// interface User {
//   _id: string;
//   username: string;
// }

/**
 * Generates a JWT token for the given user.
 * @param {User} user - The user object containing user details.
 * @returns {string} - The generated JWT token.
 */
const generateToken = (user:any): string => {
  return jwt.sign(
    { id: user._id, username: user.username }, // Payload to be encoded in the token
    process.env.JWT_SECRET as string, // Secret key for signing the token
    { expiresIn: '1h' } // Token expiration time
  );
};

export default generateToken;
