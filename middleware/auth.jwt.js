// backend/middleware/auth.jwt.js
const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "Access denied. No token provided. 🚫" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token. Are you trying to hack us? 😎" });
  }
};

module.exports = { jwtAuth };