const express = require('express');
const {
  register,
  login,
  loginAdmin,
  registerAdmin,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  registerSchema,
  adminRegisterSchema,
  loginSchema,
} = require('../validations/authValidation');

const router = express.Router();

/**
 * Public User Registration
 * Strictly assigns role='user' — cannot be changed via payload
 */
router.post('/register', validate(registerSchema), register);

/**
 * Admin Registration (internal/private endpoint)
 * Protected by ADMIN_REGISTRATION_SECRET env variable — wrong secret = 403
 * URL: POST /api/auth/register/admin
 */
router.post('/register/admin', validate(adminRegisterSchema), registerAdmin);

/**
 * Public User Login
 * Blocks admin accounts with 403 — must use /login/admin
 */
router.post('/login', validate(loginSchema), login);

/**
 * Dedicated Admin Login
 * Blocks non-admin accounts with 403 — must use /login
 */
router.post('/login/admin', validate(loginSchema), loginAdmin);

/**
 * Current Authenticated User Profile
 */
router.get('/me', protect, getMe);

module.exports = router;

