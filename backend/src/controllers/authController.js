const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');
const { BadRequestError } = require('../utils/errors');

const authController = {
  async register(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    const user = await authService.register({
      name,
      email,
      phone,
      password
    });

    sendSuccess(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: user,
    });
  },

  async login(req, res) {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    sendSuccess(res, {
      message: 'Login successful',
      data: result,
    });
  },

  async getMe(req, res) {
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, { data: user });
  }
};

module.exports = authController;
