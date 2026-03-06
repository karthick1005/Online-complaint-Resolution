const prisma = require('../config/database');
const BaseRepository = require('./baseRepository');

/**
 * Department Repository
 * 
 * Data access layer for department-related database operations.
 * Extends BaseRepository for common CRUD operations.
 */
class DepartmentRepository extends BaseRepository {
  constructor() {
    super(prisma.department);
  }
  async findAll() {
    return await prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            complaints: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id) {
    return await prisma.department.findUnique({
      where: { id },
      include: {
        categories: true,
        _count: {
          select: {
            users: true,
            complaints: true,
          },
        },
      },
    });
  }

  async create(data) {
    return await prisma.department.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.department.update({
      where: { id },
      data,
    });
  }
}

/**
 * Category Repository
 */
class CategoryRepository {
  async findAll() {
    return await prisma.category.findMany({
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

  async findByDepartment(departmentId) {
    return await prisma.category.findMany({
      where: { departmentId },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });
  }

  async create(data) {
    return await prisma.category.create({
      data,
      include: {
        department: true,
      },
    });
  }
}

module.exports = {
  departmentRepository: new DepartmentRepository(),
  categoryRepository: new CategoryRepository(),
};
