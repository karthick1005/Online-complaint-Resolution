const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

const router = express.Router();

// Analytics routes (admin, managers, complainants)
router.get(
  '/dashboard/stats',
  authMiddleware,
  rbacMiddleware(['admin', 'department_manager', 'staff', 'complainant']),
  analyticsController.getDashboardStats
);

module.exports = router;
