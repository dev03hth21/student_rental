/**
 * Async Handler Wrapper
 * Bọc các async function để tự động xử lý lỗi
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
