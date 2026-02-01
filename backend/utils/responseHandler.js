/**
 * Response Handler Utility
 * Chuẩn hóa các response trả về từ API
 */

class ResponseHandler {
  /**
   * Success response
   */
  static success(res, message, data = null, statusCode = 200) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Error response
   */
  static error(res, message, statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Paginated response
   */
  static paginated(res, message, data, pagination, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    });
  }

  /**
   * Created response
   */
  static created(res, message, data = null) {
    return this.success(res, message, data, 201);
  }

  /**
   * Bad request response
   */
  static badRequest(res, message, errors = null) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized response
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden response
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Not found response
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Internal server error response
   */
  static serverError(res, message = 'Internal server error', errors = null) {
    return this.error(res, message, 500, errors);
  }
}

module.exports = ResponseHandler;
