/**
 * Validation Utilities
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate request
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    const primaryMessage = formattedErrors[0]?.message || 'Dữ liệu không hợp lệ';

    return res.status(400).json({
      success: false,
      message: primaryMessage,
      errors: formattedErrors,
    });
  }
  
  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  // Email validation
  email: () => body('email')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  // Password validation
  password: () => body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),

  // Phone validation
  phone: (fieldName = 'phone') => body(fieldName)
    .trim()
    .matches(/^(0|\+84)[0-9]{9,10}$/)
    .withMessage('Số điện thoại không hợp lệ'),

  // Required field
  required: (fieldName, message) => body(fieldName)
    .notEmpty()
    .withMessage(message || `${fieldName} là bắt buộc`),

  // ObjectId validation
  mongoId: (fieldName = 'id') => param(fieldName)
    .isMongoId()
    .withMessage('ID không hợp lệ'),

  // Number validation
  number: (fieldName, min = 0) => body(fieldName)
    .isNumeric()
    .withMessage(`${fieldName} phải là số`)
    .isFloat({ min })
    .withMessage(`${fieldName} phải lớn hơn hoặc bằng ${min}`),

  // Pagination
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page phải là số nguyên dương'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit phải từ 1 đến 100'),
  ],
};

module.exports = {
  validate,
  validationRules,
  body,
  param,
  query,
};
