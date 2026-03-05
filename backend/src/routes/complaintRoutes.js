const express = require('express');
const { body } = require('express-validator');
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// All complaint routes require authentication
router.use(authMiddleware);

// Get all categories (for form dropdowns)
router.get('/meta/categories', complaintController.getCategories);

// Get all staff members (for assignment)
router.get('/meta/staff', complaintController.getStaff);

// Create complaint
router.post(
  '/',
  complaintController.uploadMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('categoryId').notEmpty().withMessage('Category is required')
  ],
  validationMiddleware,
  complaintController.createComplaint
);

// Get complaints
router.get('/', complaintController.getComplaints);

// Get complaint by ID
router.get('/:id', complaintController.getComplaintById);

// Update complaint status (manager, staff, admin)
router.put(
  '/:id/status',
  rbacMiddleware(['department_manager', 'staff', 'admin']),
  complaintController.uploadMiddleware,
  [
    body('status').notEmpty().withMessage('Status is required')
  ],
  validationMiddleware,
  complaintController.updateComplaintStatus
);

// Assign complaint (manager, admin)
router.post(
  '/:id/assign',
  rbacMiddleware(['department_manager', 'admin']),
  [
    body('staffId').notEmpty().withMessage('Staff ID is required')
  ],
  validationMiddleware,
  complaintController.assignComplaint
);

// Add feedback (complainant)
router.post(
  '/:id/feedback',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  validationMiddleware,
  complaintController.addFeedback
);

// Get attachments for complaint
router.get('/:id/attachments', complaintController.getAttachments);

// Download attachment
router.get('/attachment/:attachmentId/download', complaintController.downloadAttachment);

// Download status update file
router.get('/status-file/:fileId/download', complaintController.downloadStatusUpdateFile);

// Add internal comment (staff, manager, admin)
router.post(
  '/:id/comments',
  rbacMiddleware(['staff', 'department_manager', 'admin']),
  [
    body('comment').notEmpty().withMessage('Comment is required')
  ],
  validationMiddleware,
  complaintController.addComment
);

// Get comments for complaint (staff, manager, admin)
router.get(
  '/:id/comments',
  rbacMiddleware(['staff', 'department_manager', 'admin']),
  complaintController.getComments
);

// Escalate complaint (manager, admin)
router.post(
  '/:id/escalate',
  rbacMiddleware(['department_manager', 'admin']),
  [
    body('reason').notEmpty().withMessage('Escalation reason is required')
  ],
  validationMiddleware,
  complaintController.escalateComplaint
);

// Reopen complaint (complainant)
router.post(
  '/:id/reopen',
  rbacMiddleware(['complainant']),
  [
    body('reason').optional().isString()
  ],
  validationMiddleware,
  complaintController.reopenComplaint
);

module.exports = router;
