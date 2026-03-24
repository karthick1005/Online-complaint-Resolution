const prisma = require('../config/database');
const bcrypt = require('bcrypt');
const { buildPaginationMeta } = require('../utils/pagination');
const {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} = require('../utils/errors');

const userService = {
  // Create new user
  async createUser(userData) {
    const { name, email, phone, password, role, departmentId } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
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
  const page = Number.parseInt(query.page, 10) > 0 ? Number.parseInt(query.page, 10) : 1;
  const pageSize = Math.min(
    Number.parseInt(query.pageSize || query.limit, 10) > 0
      ? Number.parseInt(query.pageSize || query.limit, 10)
      : 10,
    100
  );
  const skip = (page - 1) * pageSize;

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

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.user.count({
      where: filters
    })
  ]);

  return {
    data: users,
    pagination: buildPaginationMeta({
      page,
      pageSize,
      totalItems,
    })
  };
},

  // Get single user by ID
  async getUserById(id, currentUser) {
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
          select: { name: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Authorization check: Non-admin users can only view users from their department or themselves
    if (currentUser.role !== 'admin') {
      if (currentUser.id !== id && user.departmentId !== currentUser.departmentId) {
        throw new UnauthorizedError('Unauthorized');
      }
    }

    // Remove departmentId from response (keep it hidden, only show department name)
    delete user.departmentId;

    return user;
  },

  // Update user data
  async updateUser(id, updateData, requestingUser) {
    // Only admin can change role and department
    if (requestingUser.role !== 'admin') {
      if (updateData.role || updateData.departmentId) {
        throw new ForbiddenError('Only admin can change role and department');
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
      throw new BadRequestError('Cannot delete your own account');
    }

    // Get user before deletion
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User');
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
      throw new NotFoundError('User');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid old password');
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
      throw new BadRequestError('Cannot change your own status');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User');
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
