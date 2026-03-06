const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware);

// GET all departments with their categories
router.get('/', async (req, res) => {
  try {
    // Admin and complainants can see all departments
    // Department managers and staff see only their department
    const whereCondition =
      req.user.role === 'admin' || !req.user.departmentId
        ? {}
        : { id: req.user.departmentId };

    const departments = await prisma.department.findMany({
      where: whereCondition,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            defaultPriority: true
          }
        },
        _count: {
          select: { complaints: true, users: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Create department (admin only)
router.post(
  '/',
  rbacMiddleware(['admin']),
  [
    body('name').notEmpty().withMessage('Department name is required'),
    body('description').optional()
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { name, description } = req.body;

      const department = await prisma.department.create({
        data: {
          name,
          description
        },
        include: {
          _count: {
            select: { complaints: true, users: true }
          }
        }
      });

      res.status(201).json({
        message: 'Department created successfully',
        department
      });
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// PUT - Update department (admin only)
router.put(
  '/:id',
  rbacMiddleware(['admin']),
  [
    body('name').optional().notEmpty().withMessage('Department name cannot be empty'),
    body('description').optional()
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const department = await prisma.department.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { complaints: true, users: true }
          }
        }
      });

      res.json({
        message: 'Department updated successfully',
        department
      });
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// DELETE - Delete department (admin only)
router.delete(
  '/:id',
  rbacMiddleware(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if department has users or complaints
      const department = await prisma.department.findUnique({
        where: { id },
        include: {
          _count: {
            select: { complaints: true, users: true }
          }
        }
      });

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }

      if (department._count.users > 0 || department._count.complaints > 0) {
        return res.status(400).json({
          error: 'Cannot delete department with existing users or complaints'
        });
      }

      await prisma.department.delete({
        where: { id }
      });

      res.json({ message: 'Department deleted successfully' });
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET single department by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Restrict access for non-admin users
    if (req.user.role !== 'admin' && req.user.departmentId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            defaultPriority: true
          }
        },
        users: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: { complaints: true }
        }
      }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);

  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
