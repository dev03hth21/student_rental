/**
 * Pagination Helper
 */

/**
 * Get pagination params from request
 */
const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create pagination response
 */
const createPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

module.exports = {
  getPaginationParams,
  createPaginationResponse,
};
