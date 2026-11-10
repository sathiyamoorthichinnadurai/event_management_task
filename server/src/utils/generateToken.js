const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} id - User ObjectId string
 * @param {string} role - User role ('user', 'organizer', 'admin')
 * @returns {string} - Signed JWT
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id: id ? id.toString() : id, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_interview_assessment_change_in_production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;

