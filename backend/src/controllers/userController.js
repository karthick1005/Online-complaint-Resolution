const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const userController = {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const { search, role, status } = req.query;
      const filters = {};

      if (role && role !== 'all') {
        filters.role = role;
      }

      if (status === 'active') {
        filters.isActive = true;
      } else if (status === 'inactive') {
        filters.isActive = false;
      }

      let users = await prisma.user.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          department: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(u =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          (u.phone && u.phone.includes(search))
        );
      }

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
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          departmentId: true,
          department: {
            select: { id: true, name: true }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, role, departmentId, isActive } = req.body;

      // Non-admin users can only update themselves
      if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (isActive !== undefined) updateData.isActive = isActive;

      // Only admin can change role and department
      if (req.user.role === 'admin') {
        if (role) updateData.role = role;
        if (departmentId !== undefined) updateData.departmentId = departmentId;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          department: {
            select: { name: true }
          }
        }
      });

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

      // Prevent deleting yourself
      if (req.user.id === id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      // Get user before deletion
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete user and cascade
      await prisma.user.delete({
        where: { id }
      });

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

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword }
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get departments
  async getDepartments(req, res) {
    try {
      const departments = await prisma.department.findMany({
        select: {
          id: true,
          name: true,
          description: true
        },
        orderBy: { name: 'asc' }
      });

      res.json({ data: departments });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Toggle user active status
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          department: {
            select: { name: true }
          }
        }
      });

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
