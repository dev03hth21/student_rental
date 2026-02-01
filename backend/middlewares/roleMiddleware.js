/**
 * Role-based Authorization Middleware
 * Phân quyền dựa trên role của user
 */

const ResponseHandler = require('../utils/responseHandler');

const ROLE_ALIASES = {
  owner: ['owner'],
  admin: ['admin'],
  student: ['student'],
};

const expandRoles = (roles = []) => {
  const normalized = new Set();
  roles.forEach((role) => {
    const aliases = ROLE_ALIASES[role] || [role];
    aliases.forEach((alias) => normalized.add(alias));
  });
  return Array.from(normalized);
};

/**
 * Kiểm tra role của user
 * @param  {...string} roles - Các role được phép truy cập
 */
const authorize = (...roles) => {
  const allowedRoles = expandRoles(roles);
  return (req, res, next) => {
    // Kiểm tra user có tồn tại không (phải qua protect middleware trước)
    if (!req.user) {
      return ResponseHandler.unauthorized(
        res,
        'Vui lòng đăng nhập để tiếp tục'
      );
    }

    // Kiểm tra role
    if (!allowedRoles.includes(req.user.role)) {
      return ResponseHandler.forbidden(
        res,
        `Chỉ ${allowedRoles.join(', ')} mới có quyền truy cập`
      );
    }

    next();
  };
};

/**
 * Chỉ cho phép Super Admin
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    return ResponseHandler.forbidden(res, 'Chỉ Super Admin mới có quyền truy cập');
  }
  next();
};

/**
 * Kiểm tra user là admin
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return ResponseHandler.forbidden(
      res,
      'Chỉ admin mới có quyền truy cập'
    );
  }
  next();
};

/**
 * Kiểm tra user là owner
 */
const isOwner = (req, res, next) => {
  const allowedRoles = expandRoles(['owner']);
  if (!allowedRoles.includes(req.user.role)) {
    return ResponseHandler.forbidden(
      res,
      'Chỉ chủ trọ mới có quyền truy cập'
    );
  }
  next();
};

/**
 * Kiểm tra user là student
 */
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return ResponseHandler.forbidden(
      res,
      'Chỉ sinh viên mới có quyền truy cập'
    );
  }
  next();
};

/**
 * Kiểm tra user là owner của resource
 */
const isResourceOwner = (resourceUserField = 'user') => {
  return (req, res, next) => {
    // req.resource phải được set trước đó trong controller
    const resource = req.resource;

    if (!resource) {
      return ResponseHandler.notFound(res, 'Resource không tồn tại');
    }

    // Kiểm tra owner hoặc admin
    const resourceUserId = resource[resourceUserField]?.toString() || resource[resourceUserField];
    const currentUserId = req.user._id.toString();

    if (resourceUserId !== currentUserId && req.user.role !== 'admin') {
      return ResponseHandler.forbidden(
        res,
        'Bạn không có quyền truy cập resource này'
      );
    }

    next();
  };
};

module.exports = {
  authorize,
  isAdmin,
  isOwner,
  isStudent,
  isResourceOwner,
  requireSuperAdmin,
};
