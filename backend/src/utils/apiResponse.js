function sendSuccess(res, { statusCode = 200, message, data, pagination } = {}) {
  const payload = {
    success: true,
  };

  if (message) {
    payload.message = message;
  }

  if (data !== undefined) {
    payload.data = data;
  }

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
};
