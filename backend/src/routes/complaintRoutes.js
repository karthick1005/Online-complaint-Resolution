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
const { asyncHandler } = require('../middleware/errorHandler');

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
 *                         $ref: '#/components/schemas/Category'
 */
router.get('/meta/categories', asyncHandler(complaintController.getCategories));

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
 *                         $ref: '#/components/schemas/User'
 */
router.get('/meta/staff', asyncHandler(complaintController.getStaff));

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
 *           encoding:
 *             files:
 *               style: form
 *               explode: true
 *           examples:
 *             seededComplaint:
 *               $ref: '#/components/examples/CreateComplaintExample'
 *     responses:
 *       201:
 *         description: Complaint created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         complaint:
 *                           $ref: '#/components/schemas/ComplaintDetail'
 *                         locationDetected:
 *                           type: string
 *                         locationInfo:
 *                           type: object
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
  asyncHandler(complaintController.createComplaint)
);

/**
 * @swagger
 * /complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           example: Registered
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           example: High
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           example: clxdeptinfra
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: pothole
 *     responses:
 *       200:
 *         description: List of complaints
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
 *                         $ref: '#/components/schemas/ComplaintListItem'
 */
router.get('/', asyncHandler(complaintController.getComplaints));

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
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ComplaintDetail'
 *       404:
 *         description: Complaint not found
 */
router.get('/:id', asyncHandler(complaintController.getComplaintById));

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
 *           examples:
 *             inProgress:
 *               $ref: '#/components/examples/UpdateStatusExample'
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ComplaintDetail'
 */
router.put(
  '/:id/status',
  rbacMiddleware(['department_manager', 'staff', 'admin']),
  complaintController.uploadMiddleware,
  [body('status').notEmpty()],
  validationMiddleware,
  asyncHandler(complaintController.updateComplaintStatus)
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
 *           examples:
 *             assignInfraStaff:
 *               $ref: '#/components/examples/AssignComplaintExample'
 *     responses:
 *       200:
 *         description: Assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ComplaintDetail'
 */
router.post(
  '/:id/assign',
  rbacMiddleware(['department_manager', 'admin']),
  [body('staffId').notEmpty()],
  validationMiddleware,
  asyncHandler(complaintController.assignComplaint)
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
 *               comment:
 *                 type: string
 *           examples:
 *             closeWithFeedback:
 *               $ref: '#/components/examples/FeedbackExample'
 *     responses:
 *       200:
 *         description: Feedback added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 */
router.post(
  '/:id/feedback',
  [body('rating').isInt({ min: 1, max: 5 })],
  validationMiddleware,
  asyncHandler(complaintController.addFeedback)
);

/**
 * @swagger
 * /complaints/{id}/attachments:
 *   get:
 *     summary: Get complaint attachments
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attachment list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 */
router.get('/:id/attachments', asyncHandler(complaintController.getAttachments));

/**
 * @swagger
 * /complaints/attachment/{attachmentId}/download:
 *   get:
 *     summary: Download attachment
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/attachment/:attachmentId/download', asyncHandler(complaintController.downloadAttachment));

/**
 * @swagger
 * /complaints/status-file/{fileId}/download:
 *   get:
 *     summary: Download status update file
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status-file/:fileId/download', asyncHandler(complaintController.downloadStatusUpdateFile));

/**
 * @swagger
 * /complaints/{id}/comments:
 *   post:
 *     summary: Add internal comment
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     description: Roles - staff, department_manager, admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment:
 *                 type: string
 *           examples:
 *             internalNote:
 *               $ref: '#/components/examples/InternalCommentExample'
 *     responses:
 *       200:
 *         description: Internal comment added
 */
router.post(
  '/:id/comments',
  rbacMiddleware(['staff', 'department_manager', 'admin']),
  [body('comment').notEmpty()],
  validationMiddleware,
  asyncHandler(complaintController.addComment)
);

/**
 * @swagger
 * /complaints/{id}/comments:
 *   get:
 *     summary: Get comments
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Internal comments list
 */
router.get(
  '/:id/comments',
  rbacMiddleware(['staff', 'department_manager', 'admin']),
  asyncHandler(complaintController.getComments)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *           examples:
 *             slaRisk:
 *               $ref: '#/components/examples/EscalateComplaintExample'
 *     responses:
 *       200:
 *         description: Complaint escalated
 */
router.post(
  '/:id/escalate',
  rbacMiddleware(['department_manager', 'admin']),
  [body('reason').notEmpty()],
  validationMiddleware,
  asyncHandler(complaintController.escalateComplaint)
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *           examples:
 *             reopenAfterRain:
 *               $ref: '#/components/examples/ReopenComplaintExample'
 *     responses:
 *       200:
 *         description: Complaint reopened
 */
router.post(
  '/:id/reopen',
  rbacMiddleware(['complainant']),
  [body('reason').optional().isString()],
  validationMiddleware,
  asyncHandler(complaintController.reopenComplaint)
);

module.exports = router;
