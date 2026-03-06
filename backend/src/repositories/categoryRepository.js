const prisma = require('../config/database');
const BaseRepository = require('./baseRepository');

/**
 * Category Repository
 * 
 * Handles complaint categories
 */
class CategoryRepository extends BaseRepository {
  constructor() {
    super(prisma.category);
  }

  /**
   * Find all categories with department info
   */
  async findAllWithDepartments() {
    return await this.findAll({
      include: {
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
   * Find categories by department
   */
  async findByDepartment(departmentId) {
    return await this.findAll({
      where: { departmentId },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Create category with department validation
   */
  async createWithDepartment(data) {
    return await this.model.create({
      data,
      include: {
        department: true,
      },
    });
  }

  /**
   * Get category with complaint count
   */
  async findByIdWithStats(id) {
    return await this.model.findUnique({
      where: { id },
      include: {
        department: true,
        _count: {
          select: {
            complaints: true,
          },
        },
      },
    });
  }
}

module.exports = new CategoryRepository();
