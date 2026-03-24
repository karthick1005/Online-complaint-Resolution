/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               defaultPriority:
 *                 type: string
 *         _count:
 *           type: object
 *           properties:
 *             complaints:
 *               type: integer
 *             users:
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
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     description: Admin sees all, others see their own department
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get('/', async (req, res) => {
  try {
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
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     description: Role - admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created
 */
router.post(
  '/',
  rbacMiddleware(['admin']),
  [
    body('name').notEmpty(),
    body('description').optional()
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { name, description } = req.body;

      const department = await prisma.department.create({
        data: { name, description },
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
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     description: Role - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Department updated
 */
router.put(
  '/:id',
  rbacMiddleware(['admin']),
  [
    body('name').optional().notEmpty(),
    body('description').optional()
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const department = await prisma.department.update({
        where: { id },
        data: { name, description },
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
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     description: Role - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Department deleted
 *       400:
 *         description: Cannot delete if users/complaints exist
 */
router.delete(
  '/:id',
  rbacMiddleware(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

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

      await prisma.department.delete({ where: { id } });

      res.json({ message: 'Department deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     description: Non-admin users can only access their own department
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Department details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;