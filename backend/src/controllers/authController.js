const authService = require('../services/authService');

const authController = {
  async register(req, res) {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      const user = await authService.register({
        name,
        email,
        phone,
        password
      });

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  async getMe(req, res) {
    try {
      const user = await authService.getMe(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
};

module.exports = authController;
