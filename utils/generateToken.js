const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Generates a JWT token for the given user.
 * @param {Object} user - The user object containing user details.
 * @returns {string} - The generated JWT token.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username }, // Payload to be encoded in the token
    process.env.JWT_SECRET, // Secret key for signing the token
    { expiresIn: "1h" } // Token expiration time
  );
};

module.exports = generateToken;
