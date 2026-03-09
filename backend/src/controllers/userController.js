const userService = require('../services/userService');

const userController = {
  // Create new user (admin only)
  async createUser(req, res) {
    try {
      const { name, email, phone, password, role, departmentId } = req.body;

      // Validate required fields
      if (!name || !email || !password || !role) {
        return res.status(400).json({ 
          error: 'Name, email, password, and role are required' 
        });
      }

      const user = await userService.createUser({
        name,
        email,
        phone,
        password,
        role,
        departmentId
      });

      res.status(201).json({
        message: 'User created successfully',
        user
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      console.log('Current user:', req.user);
      const users = await userService.getAllUsers(req.query, req.user);
      res.json({
        data: users,
        total: users.length
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id, req.user);
      res.json(user);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(404).json({ error: error.message });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, role, departmentId, isActive } = req.body;

      // Non-admin users can only update themselves
      if (req.user.role !== 'admin' && req.user.id !== id && req.user.role !== 'department_manager') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (role) updateData.role = role;
      if (departmentId !== undefined) updateData.departmentId = departmentId;

      const user = await userService.updateUser(id, updateData, req.user);

      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id, req.user.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id;

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      await userService.changePassword(userId, currentPassword, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get departments
  async getDepartments(req, res) {
    try {
      const departments = await userService.getDepartments();
      res.json({ data: departments });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Toggle user active status
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await userService.toggleUserStatus(id, req.user.id);

      res.json({
        message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
        user: updatedUser
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = userController;
