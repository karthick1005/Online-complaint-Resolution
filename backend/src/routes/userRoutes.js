/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, department_manager, staff, complainant]
 *         departmentId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 */

const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Role - admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, department_manager, staff, complainant]
 *               departmentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post(
  '/',
  rbacMiddleware(['admin']),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'department_manager', 'staff', 'complainant']),
    body('departmentId').optional()
  ],
  validationMiddleware,
  userController.createUser
);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    body('confirmPassword').custom((v, { req }) => v === req.body.newPassword)
  ],
  validationMiddleware,
  userController.changePassword
);

/**
 * @swagger
 * /users/departments/list:
 *   get:
 *     summary: Get departments list
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/departments/list', userController.getDepartments);

/**
 * @swagger
 * /users/create-manager:
 *   post:
 *     summary: Create department manager
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Role - admin
 */
router.post(
  '/create-manager',
  rbacMiddleware(['admin']),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('departmentId').notEmpty()
  ],
  validationMiddleware,
  (req, res, next) => {
    req.body.role = 'department_manager';
    userController.createUser(req, res, next);
  }
);

/**
 * @swagger
 * /users/create-staff:
 *   post:
 *     summary: Create staff user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Roles - admin, department_manager
 */
router.post(
  '/create-staff',
  rbacMiddleware(['admin', 'department_manager']),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('departmentId').notEmpty()
  ],
  validationMiddleware,
  (req, res, next) => {
    req.body.role = 'staff';
    userController.createUser(req, res, next);
  }
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Roles - admin, department_manager
 */
router.get(
  '/',
  rbacMiddleware(['admin', 'department_manager']),
  userController.getAllUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  [
    body('name').optional().notEmpty(),
    body('phone').optional().isMobilePhone(),
    body('role').optional().isIn(['admin', 'department_manager', 'staff', 'complainant'])
  ],
  validationMiddleware,
  userController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Role - admin
 */
router.delete(
  '/:id',
  rbacMiddleware(['admin']),
  userController.deleteUser
);

/**
 * @swagger
 * /users/{id}/toggle-status:
 *   post:
 *     summary: Toggle user active status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Role - admin
 */
router.post(
  '/:id/toggle-status',
  rbacMiddleware(['admin']),
  userController.toggleUserStatus
);

module.exports = router;