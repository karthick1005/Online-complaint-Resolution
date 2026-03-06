const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Create user (admin only)
router.post(
  '/',
  rbacMiddleware(['admin']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').notEmpty().isIn(['admin', 'department_manager', 'staff', 'complainant']).withMessage('Valid role is required'),
    body('departmentId').optional()
  ],
  validationMiddleware,
  userController.createUser
);

// Change password (must be before /:id routes)
router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('Passwords must match')
  ],
  validationMiddleware,
  userController.changePassword
);

// Get departments
router.get('/departments/list', userController.getDepartments);

// Get all users (admin only)
router.get(
  '/',
  rbacMiddleware(['admin']),
  userController.getAllUsers
);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone is required'),
    body('role').optional().isIn(['admin', 'department_manager', 'staff', 'complainant']),
  ],
  validationMiddleware,
  userController.updateUser
);

// Delete user (admin only)
router.delete(
  '/:id',
  rbacMiddleware(['admin']),
  userController.deleteUser
);

// Toggle user status (admin only)
router.post(
  '/:id/toggle-status',
  rbacMiddleware(['admin']),
  userController.toggleUserStatus
);

module.exports = router;
