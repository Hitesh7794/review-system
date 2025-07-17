// backend/middleware/role.check.js
const allowedRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access forbidden. Required roles: ${roles.join(', ')}. Your role: ${req.user.role} 🚷`
      });
    }
    next();
  };
};

module.exports = allowedRoles;