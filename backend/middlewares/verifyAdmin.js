/**
 * Admin Verification Middleware
 * Middleware kiểm tra quyền admin
 */

/**
 * Verify if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyAdmin = (req, res, next) => {
  // Kiểm tra user đã được authenticate chưa (từ verifyToken middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Kiểm tra role có phải admin không
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: admin only'
    });
  }

  // Cho phép tiếp tục
  next();
};

module.exports = verifyAdmin;
