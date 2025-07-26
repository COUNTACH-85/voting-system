import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Get user from request headers
 * @param {Object} req - Next.js request object
 * @returns {Object|null} User object or null
 */
export function getUserFromRequest(req) {
  try {
    // For Next.js App Router, req.headers is a Headers object
    let authHeader;
    if (req && req.headers && typeof req.headers.get === 'function') {
      authHeader = req.headers.get('authorization');
    } else if (req && req.headers) {
      authHeader = req.headers.authorization;
    }
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has required role
 * @param {Object} user - User object
 * @param {String|Array} requiredRoles - Required role(s)
 * @returns {Boolean} True if user has required role
 */
export function hasRole(user, requiredRoles) {
  if (!user) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return user.role === requiredRoles;
} 