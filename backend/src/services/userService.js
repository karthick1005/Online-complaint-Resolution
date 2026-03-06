const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const userService = {
  // Create new user
  async createUser(userData) {
    const { name, email, phone, password, role, departmentId } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role,
        departmentId: departmentId || null,
        isActive: true
      },
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

    return user;
  },

  // Get all users with filtering
async getAllUsers(query = {}, currentUser) {
  const { search, role, status } = query;

  const filters = {};

  // Exclude current user
  filters.id = { not: currentUser.id };

  // Role filter
  if (role && role !== 'all') {
    filters.role = role;
  }

  // Status filter
  if (status === 'active') {
    filters.isActive = true;
  } else if (status === 'inactive') {
    filters.isActive = false;
  }

  // Department restriction
  if (currentUser.role !== 'admin') {
    filters.departmentId = currentUser.departmentId;
  }

  // Search filter
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } }
    ];
  }

  console.log('Fetching users with filters:', filters);

  const users = await prisma.user.findMany({
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

  return users;
},

  // Get single user by ID
  async getUserById(id) {
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
        department: {
          select: { name: true }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  // Update user data
  async updateUser(id, updateData, requestingUser) {
    // Only admin can change role and department
    if (requestingUser.role !== 'admin') {
      if (updateData.role || updateData.departmentId) {
        throw new Error('Only admin can change role and department');
      }
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

    return user;
  },

  // Delete user (soft delete)
  async deleteUser(id, requestingUserId) {
    // Prevent deleting yourself
    if (requestingUserId === id) {
      throw new Error('Cannot delete your own account');
    }

    // Get user before deletion
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    return user;
  },

  // Change password
  async changePassword(id, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid old password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword }
    });
  },

  // Toggle user status (activate/deactivate)
  async toggleUserStatus(id, requestingUserId) {
    // Prevent disabling yourself
    if (requestingUserId === id) {
      throw new Error('Cannot change your own status');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
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

    return updatedUser;
  },

  // Get departments list
  async getDepartments() {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return departments;
  }
};

module.exports = userService;
