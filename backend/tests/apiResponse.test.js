const { sendSuccess } = require('../src/utils/apiResponse');

function createMockResponse() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
}

describe('api response helpers', () => {
  test('sendSuccess returns a consistent success envelope', () => {
    const res = createMockResponse();

    sendSuccess(res, {
      statusCode: 201,
      message: 'Created',
      data: { id: 'cmp-1' },
      pagination: { page: 1, totalPages: 3 },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: 'Created',
      data: { id: 'cmp-1' },
      pagination: { page: 1, totalPages: 3 },
    });
  });

  test('sendSuccess omits optional properties that are not provided', () => {
    const res = createMockResponse();

    sendSuccess(res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
    });
  });
});
