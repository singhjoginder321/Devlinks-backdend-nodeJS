const jwt = require("jsonwebtoken");

const authenticateTokenCookies = (req, res, next) => {
  // Extract the token from cookies
  const token = req.cookies.token;

  if (token == null) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token

    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateTokenCookies;
