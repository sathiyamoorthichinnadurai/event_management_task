const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new public user (Attendee)
 * @route   POST /api/auth/register
 * @access  Public
 * @note    Strictly assigns role='user' regardless of request body
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Role is strictly set to 'user' for public registration — cannot be overridden
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Public User (Attendee) login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Normalize email to lowercase and trim
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Role separation check: If admin tries to log in via user portal, redirect them to admin login
    if (user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Administrators must log in via the dedicated Admin Portal (/login/admin)',
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'User login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dedicated Admin login
 * @route   POST /api/auth/login/admin
 * @access  Public (Restricted to role: 'admin')
 */
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Strict role guard: Only 'admin' role allowed
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Administrator privileges required to log in here',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new Admin account (private/internal endpoint)
 * @route   POST /api/auth/register/admin
 * @access  Private — requires ADMIN_REGISTRATION_SECRET in request body
 * @security The URL itself is not secret; the adminSecret header/body field guards it.
 *           Store ADMIN_REGISTRATION_SECRET in .env — never commit it.
 */
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    // Verify the secret key — compare against env variable, never expose the actual secret
    const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET;
    if (!expectedSecret) {
      // Safety net: if env var is not configured, block all admin registrations
      return res.status(503).json({
        success: false,
        message: 'Admin registration is not configured on this server',
      });
    }

    if (adminSecret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin registration secret. Access denied.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Role is strictly set to 'admin' for this route — cannot be overridden
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  loginAdmin,
  registerAdmin,
  getMe,
};
