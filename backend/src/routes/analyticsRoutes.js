const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

const router = express.Router();


/**
 * @swagger
 * /analytics/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get(
  '/dashboard/stats',
  authMiddleware,
  rbacMiddleware(['admin', 'department_manager', 'staff', 'complainant']),
  analyticsController.getDashboardStats
);

module.exports = router;
