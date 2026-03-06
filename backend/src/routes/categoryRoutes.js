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

// GET all categories
router.get('/', async (req, res) => {
  try {
    const { departmentId } = req.query;

    const whereCondition = {};
    
    // Filter by department if provided
    if (departmentId) {
      whereCondition.departmentId = departmentId;
    }
    
    // Non-admin users can only see categories from their department
    if (req.user.role !== 'admin' && req.user.departmentId) {
      whereCondition.departmentId = req.user.departmentId;
    }

    const categories = await prisma.category.findMany({
      where: whereCondition,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: { complaints: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ data: categories, total: categories.length });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Create category (admin and department_manager)
router.post(
  '/',
  rbacMiddleware(['admin', 'department_manager']),
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('departmentId').notEmpty().withMessage('Department is required'),
    body('defaultPriority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
    body('color').optional()
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { name, departmentId, defaultPriority, color } = req.body;

      // Department managers can only create categories for their department
      if (req.user.role === 'department_manager' && departmentId !== req.user.departmentId) {
        return res.status(403).json({ error: 'You can only create categories for your department' });
      }

      const category = await prisma.category.create({
        data: {
          name,
          departmentId,
          defaultPriority: defaultPriority || 'Medium',
          color: color || null
        },
        include: {
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// PUT - Update category (admin and department_manager)
router.put(
  '/:id',
  rbacMiddleware(['admin', 'department_manager']),
  [
    body('name').optional().notEmpty().withMessage('Category name cannot be empty'),
    body('departmentId').optional().notEmpty().withMessage('Department cannot be empty'),
    body('defaultPriority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
    body('color').optional()
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, departmentId, defaultPriority, color } = req.body;

      // Check if category exists and get its current department
      const existingCategory = await prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Department managers can only update categories from their department
      if (req.user.role === 'department_manager') {
        if (existingCategory.departmentId !== req.user.departmentId) {
          return res.status(403).json({ error: 'You can only update categories from your department' });
        }
        if (departmentId && departmentId !== req.user.departmentId) {
          return res.status(403).json({ error: 'You cannot move categories to other departments' });
        }
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (departmentId) updateData.departmentId = departmentId;
      if (defaultPriority) updateData.defaultPriority = defaultPriority;
      if (color !== undefined) updateData.color = color;

      const category = await prisma.category.update({
        where: { id },
        data: updateData,
        include: {
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.json({
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// DELETE - Delete category (admin and department_manager)
router.delete(
  '/:id',
  rbacMiddleware(['admin', 'department_manager']),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if category exists and has complaints
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { complaints: true }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Department managers can only delete categories from their department
      if (req.user.role === 'department_manager' && category.departmentId !== req.user.departmentId) {
        return res.status(403).json({ error: 'You can only delete categories from your department' });
      }

      if (category._count.complaints > 0) {
        return res.status(400).json({
          error: 'Cannot delete category with existing complaints'
        });
      }

      await prisma.category.delete({
        where: { id }
      });

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET single category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: { complaints: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Non-admin users can only view categories from their department
    if (req.user.role !== 'admin' && category.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
