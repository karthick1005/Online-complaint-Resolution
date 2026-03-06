const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET all departments with their categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const whereCondition =
      req.user.role === 'admin'
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
// GET single department by ID
router.get('/:id', authMiddleware, async (req, res) => {
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
