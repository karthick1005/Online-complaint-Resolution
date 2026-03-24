const userService = require('../services/userService');
const { sendSuccess } = require('../utils/apiResponse');
const {
  BadRequestError,
  ForbiddenError,
} = require('../utils/errors');

const userController = {
  // Create new user (admin only)
  async createUser(req, res) {
    const { name, email, phone, password, role, departmentId } = req.body;

    if (!name || !email || !password || !role) {
      throw new BadRequestError('Name, email, password, and role are required');
    }

    const user = await userService.createUser({
      name,
      email,
      phone,
      password,
      role,
      departmentId
    });

    sendSuccess(res, {
      statusCode: 201,
      message: 'User created successfully',
      data: user,
    });
  },

  // Get all users (admin only)
  async getAllUsers(req, res) {
    const users = await userService.getAllUsers(req.query, req.user);
    sendSuccess(res, users);
  },

  // Get user by ID
  async getUserById(req, res) {
    const { id } = req.params;
    const user = await userService.getUserById(id, req.user);
    sendSuccess(res, { data: user });
  },

  // Update user
  async updateUser(req, res) {
    const { id } = req.params;
    const { name, phone, role, departmentId, isActive } = req.body;

    if (req.user.role !== 'admin' && req.user.id !== id && req.user.role !== 'department_manager') {
      throw new ForbiddenError('Unauthorized');
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;
    if (departmentId !== undefined) updateData.departmentId = departmentId;

    const user = await userService.updateUser(id, updateData, req.user);

    sendSuccess(res, {
      message: 'User updated successfully',
      data: user,
    });
  },

  // Delete user (admin only)
  async deleteUser(req, res) {
    const { id } = req.params;
    await userService.deleteUser(id, req.user.id);
    sendSuccess(res, { message: 'User deleted successfully' });
  },

  // Change password
  async changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    await userService.changePassword(userId, currentPassword, newPassword);

    sendSuccess(res, { message: 'Password changed successfully' });
  },

  // Get departments
  async getDepartments(req, res) {
    const departments = await userService.getDepartments();
    sendSuccess(res, { data: departments });
  },

  // Toggle user active status
  async toggleUserStatus(req, res) {
    const { id } = req.params;
    const updatedUser = await userService.toggleUserStatus(id, req.user.id);

    sendSuccess(res, {
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser,
    });
  }
};

module.exports = userController;
