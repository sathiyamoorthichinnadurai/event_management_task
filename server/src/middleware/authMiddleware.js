const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Mandatory Authentication Middleware:
 * Verifies JWT token and attaches authenticated user to req.user.
 * Rejects unauthenticated requests with 401.
 */
const protect = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Access token is missing or malformed',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key_interview_assessment_change_in_production'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact an administrator',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or expired access token',
    });
  }
};

/**
 * Optional Authentication Middleware:
 * If an Authorization Bearer token is provided and valid, attaches user to req.user.
 * If no token is provided, safely continues without failing (req.user = null).
 * Used for public discovery endpoints so guests can browse freely while logged-in
 * users have their personalized booking status annotated.
 */
const optionalAuth = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key_interview_assessment_change_in_production'
    );
    const user = await User.findById(decoded.id).select('-password');
    req.user = user && user.isActive ? user : null;
  } catch (err) {
    req.user = null;
  }

  next();
};

/**
 * Role-Based Access Control (RBAC) Middleware:
 * Enforces that req.user matches one of the specified allowed roles.
 * @param  {...string} roles - e.g. 'user', 'admin'
 */
const allowedRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  allowedRoles,
};
