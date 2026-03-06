const prisma = require('../config/database');
const BaseRepository = require('./baseRepository');

/**
 * User Repository
 * 
 * Data access layer for user-related database operations
 * Extends BaseRepository for common CRUD operations.
 */
class UserRepository {
  /**
   * Create a new user
   */
  async create(data) {
    return await prisma.user.create({
      data,
      include: {
        department: true,
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Find many users with filters
   */
  async findMany(filters = {}) {
    const { role, departmentId, isActive, search, limit = 50, offset = 0 } = filters;

    const where = {};
    if (role) where.role = role;
    if (departmentId) where.departmentId = departmentId;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Find staff users (for assignment)
   */
  async findStaff(departmentId = null) {
    const where = {
      role: {
        in: ['staff', 'department_manager', 'admin'],
      },
      isActive: true,
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Update user
   */
  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        department: true,
      },
    });
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id) {
    return await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Toggle user active status
   */
  async toggleStatus(id) {
    const user = await this.findById(id);
    return await prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
    });
  }

  /**
   * Count users by role
   */
  async countByRole() {
    return await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: {
        isActive: true,
      },
    });
  }
}

module.exports = new UserRepository();
