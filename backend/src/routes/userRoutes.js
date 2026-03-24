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
const { asyncHandler } = require('../middleware/errorHandler');

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
 *           examples:
 *             manager:
 *               $ref: '#/components/examples/CreateManagerExample'
 *             staff:
 *               $ref: '#/components/examples/CreateStaffExample'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
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
  asyncHandler(userController.createUser)
);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Admin@123
 *               newPassword:
 *                 type: string
 *                 example: Admin@1234
 *               confirmPassword:
 *                 type: string
 *                 example: Admin@1234
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 */
router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    body('confirmPassword').custom((v, { req }) => v === req.body.newPassword)
  ],
  validationMiddleware,
  asyncHandler(userController.changePassword)
);

/**
 * @swagger
 * /users/departments/list:
 *   get:
 *     summary: Get departments list
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Department lookup list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Department'
 */
router.get('/departments/list', asyncHandler(userController.getDepartments));

/**
 * @swagger
 * /users/create-manager:
 *   post:
 *     summary: Create department manager
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
 *             required: [name, email, password, departmentId]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               departmentId:
 *                 type: string
 *           examples:
 *             seededStyleManager:
 *               $ref: '#/components/examples/CreateManagerExample'
 *     responses:
 *       201:
 *         description: Department manager created
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
  asyncHandler(async (req, res) => {
    req.body.role = 'department_manager';
    return userController.createUser(req, res);
  })
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, departmentId]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               departmentId:
 *                 type: string
 *           examples:
 *             seededStyleStaff:
 *               $ref: '#/components/examples/CreateStaffExample'
 *     responses:
 *       201:
 *         description: Staff user created
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
  asyncHandler(async (req, res) => {
    req.body.role = 'staff';
    return userController.createUser(req, res);
  })
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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: manager
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           example: department_manager
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: active
 *     responses:
 *       200:
 *         description: Paginated users list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get(
  '/',
  rbacMiddleware(['admin', 'department_manager']),
  asyncHandler(userController.getAllUsers)
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 */
router.get('/:id', asyncHandler(userController.getUserById));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 */
router.put(
  '/:id',
  [
    body('name').optional().notEmpty(),
    body('phone').optional().isMobilePhone(),
    body('role').optional().isIn(['admin', 'department_manager', 'staff', 'complainant'])
  ],
  validationMiddleware,
  asyncHandler(userController.updateUser)
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
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete(
  '/:id',
  rbacMiddleware(['admin']),
  asyncHandler(userController.deleteUser)
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
 *     responses:
 *       200:
 *         description: User toggled active or inactive
 */
router.post(
  '/:id/toggle-status',
  rbacMiddleware(['admin']),
  asyncHandler(userController.toggleUserStatus)
);

module.exports = router;
