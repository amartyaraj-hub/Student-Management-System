import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fbe7ef8429df34ab9c34d284ab91d09e8432a101f3bb91dbf81dbce6e44b9a91');

    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or suspended'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token validation failed. Not authorized.'
    });
  }
};

// Grant access to specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};
