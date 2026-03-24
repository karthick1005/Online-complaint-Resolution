/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaint management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *         categoryId:
 *           type: string
 *         createdAt:
 *           type: string
 */

const express = require('express');
const { body } = require('express-validator');
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// All complaint routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /complaints/meta/categories:
 *   get:
 *     summary: Get categories for dropdown
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/meta/categories', complaintController.getCategories);

/**
 * @swagger
 * /complaints/meta/staff:
 *   get:
 *     summary: Get staff list for assignment
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff
 */
router.get('/meta/staff', complaintController.getStaff);

/**
 * @swagger
 * /complaints:
 *   post:
 *     summary: Create complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, categoryId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               files:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Complaint created
 */
router.post(
  '/',
  complaintController.uploadMiddleware,
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('categoryId').notEmpty()
  ],
  validationMiddleware,
  complaintController.createComplaint
);

/**
 * @swagger
 * /complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints
 */
router.get('/', complaintController.getComplaints);

/**
 * @swagger
 * /complaints/{id}:
 *   get:
 *     summary: Get complaint by ID
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint details
 *       404:
 *         description: Complaint not found
 */
router.get('/:id', complaintController.getComplaintById);

/**
 * @swagger
 * /complaints/{id}/status:
 *   put:
 *     summary: Update complaint status
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     description: Roles - admin, staff, department_manager
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put(
  '/:id/status',
  rbacMiddleware(['department_manager', 'staff', 'admin']),
  complaintController.uploadMiddleware,
  [body('status').notEmpty()],
  validationMiddleware,
  complaintController.updateComplaintStatus
);

/**
 * @swagger
 * /complaints/{id}/assign:
 *   post:
 *     summary: Assign complaint to staff
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     description: Roles - admin, department_manager
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [staffId]
 *             properties:
 *               staffId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assigned successfully
 */
router.post(
  '/:id/assign',
  rbacMiddleware(['department_manager', 'admin']),
  [body('staffId').notEmpty()],
  validationMiddleware,
  complaintController.assignComplaint
);

/**
 * @swagger
 * /complaints/{id}/feedback:
 *   post:
 *     summary: Add feedback to complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     description: Role - complainant
 *     parameters:
 *       - in: path
 *         name: id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Feedback added
 */
router.post(
  '/:id/feedback',
  [body('rating').isInt({ min: 1, max: 5 })],
  validationMiddleware,
  complaintController.addFeedback
);

/**
 * @swagger
 * /complaints/{id}/attachments:
 *   get:
 *     summary: Get complaint attachments
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/attachments', complaintController.getAttachments);

/**
 * @swagger
 * /complaints/attachment/{attachmentId}/download:
 *   get:
 *     summary: Download attachment
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/attachment/:attachmentId/download', complaintController.downloadAttachment);

/**
 * @swagger
 * /complaints/status-file/{fileId}/download:
 *   get:
 *     summary: Download status update file
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status-file/:fileId/download', complaintController.downloadStatusUpdateFile);

/**
 * @swagger
 * /complaints/{id}/comments:
 *   post:
 *     summary: Add internal comment
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     description: Roles - staff, department_manager, admin
 */
router.post(
  '/:id/comments',
  rbacMiddleware(['staff', 'department_manager', 'admin']),
  [body('comment').notEmpty()],
  validationMiddleware,
  complaintController.addComment
);

/**
 * @swagger
 * /complaints/{id}/comments:
 *   get:
 *     summary: Get comments
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/comments',
  rbacMiddleware(['staff', 'department_manager', 'admin']),
  complaintController.getComments
);

/**
 * @swagger
 * /complaints/{id}/escalate:
 *   post:
 *     summary: Escalate complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     description: Roles - admin, department_manager
 */
router.post(
  '/:id/escalate',
  rbacMiddleware(['department_manager', 'admin']),
  [body('reason').notEmpty()],
  validationMiddleware,
  complaintController.escalateComplaint
);

/**
 * @swagger
 * /complaints/{id}/reopen:
 *   post:
 *     summary: Reopen complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     description: Role - complainant
 */
router.post(
  '/:id/reopen',
  rbacMiddleware(['complainant']),
  [body('reason').optional().isString()],
  validationMiddleware,
  complaintController.reopenComplaint
);

module.exports = router;