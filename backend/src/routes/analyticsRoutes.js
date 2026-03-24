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
 *     description: Returns stats in the standardized `success/data` response format. Values vary by authenticated role.
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardStats'
 */
router.get(
  '/dashboard/stats',
  authMiddleware,
  rbacMiddleware(['admin', 'department_manager', 'staff', 'complainant']),
  analyticsController.getDashboardStats
);

module.exports = router;
