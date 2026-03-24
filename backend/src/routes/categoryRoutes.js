/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management APIs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         departmentId:
 *           type: string
 *         defaultPriority:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         color:
 *           type: string
 *         department:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         _count:
 *           type: object
 *           properties:
 *             complaints:
 *               type: integer
 */

const express = require('express');
const prisma = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { body } = require('express-validator');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', async (req, res) => {
  try {
    const { departmentId } = req.query;

    const whereCondition = {};

    if (departmentId) {
      whereCondition.departmentId = departmentId;
    }

    if (req.user.role !== 'admin' && req.user.departmentId) {
      whereCondition.departmentId = req.user.departmentId;
    }

    const categories = await prisma.category.findMany({
      where: whereCondition,
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { complaints: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ data: categories, total: categories.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, departmentId]
 *             properties:
 *               name:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               defaultPriority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/',
  rbacMiddleware(['admin', 'department_manager']),
  [
    body('name').notEmpty(),
    body('departmentId').notEmpty(),
    body('defaultPriority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
    body('color').optional()
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { name, departmentId, defaultPriority, color } = req.body;

      if (req.user.role === 'department_manager' && departmentId !== req.user.departmentId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const category = await prisma.category.create({
        data: {
          name,
          departmentId,
          defaultPriority: defaultPriority || 'Medium',
          color: color || null
        },
        include: {
          department: { select: { id: true, name: true } }
        }
      });

      res.status(201).json({ message: 'Created', category });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  rbacMiddleware(['admin', 'department_manager']),
  validationMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, departmentId, defaultPriority, color } = req.body;

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      const category = await prisma.category.update({
        where: { id },
        data: { name, departmentId, defaultPriority, color },
      });

      res.json({ message: 'Updated', category });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  rbacMiddleware(['admin', 'department_manager']),
  async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.category.delete({ where: { id } });

      res.json({ message: 'Deleted' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id }
    });

    if (!category) return res.status(404).json({ error: 'Not found' });

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;  