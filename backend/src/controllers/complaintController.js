const { PrismaClient } = require('@prisma/client');
const complaintService = require('../services/complaintService');
const { getLocationInfo } = require('../utils/geoLocation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 10485760 },
  fileFilter
});

const complaintController = {
  uploadMiddleware: upload.array('files', 5),

  async createComplaint(req, res) {
    try {
      const { title, description, categoryId, priority, latitude, longitude, address } = req.body;

      // Get location info (with fallback to IP-based geolocation)
      const locationInfo = await getLocationInfo(req, latitude, longitude);
      
      console.log('📍 Location Detection:', {
        source: locationInfo.source,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        city: locationInfo.city || 'N/A'
      });

      const complaint = await complaintService.createComplaint(
        {
          title,
          description,
          categoryId,
          priority,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude,
          address: address || locationInfo.city || 'Location not specified'
        },
        req.user.id
      );

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await prisma.attachment.create({
            data: {
              complaintId: complaint.id,
              filePath: file.path,
              fileType: file.mimetype,
              uploadedBy: req.user.id,
              fileSize: file.size
            }
          });
        }
      }

      res.status(201).json({
        message: 'Complaint created successfully',
        complaint,
        locationDetected: locationInfo.source,
        locationInfo: {
          source: locationInfo.source,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getComplaints(req, res) {
    try {
      const { status, priority, departmentId, limit = 10, offset = 0 } = req.query;
      const filters = { limit: parseInt(limit), offset: parseInt(offset) };

      // RBAC: Filter complaints based on user role
      switch (req.user.role) {
        case 'complainant':
          // Complainants see only their own complaints
          filters.userId = req.user.id
          break
        case 'staff':
          // Staff see only complaints assigned to them
          filters.assignedToId = req.user.id
          break
        case 'department_manager':
          console.log('Department Manager Access - Filtering by department:', req.user.departmentId);
          // Managers see all complaints in their department
          filters.departmentId = req.user.departmentId
          break
        case 'admin':
          // Admins see all complaints
          break
        default:
          return res.status(403).json({ error: 'Invalid user role' })
      }
      console.log('Fetching complaints with filters:', filters);
      // Additional filters
      if (status) filters.status = status
      if (priority) filters.priority = priority
      if (departmentId && req.user.role === 'admin' ) {
        filters.departmentId = departmentId
      }

      const result = await complaintService.getComplaints(filters)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async getComplaintById(req, res) {
    try {
      const complaint = await complaintService.getComplaintById(req.params.id);

      // RBAC: Check if user has access
      if (req.user.role === 'admin') {
        // Admins can see all complaints
      } else if (req.user.role === 'department_manager') {
        // Managers can only see complaints from their department
        if (complaint.departmentId !== req.user.departmentId) {
          return res.status(403).json({ error: 'Access denied - not your department' });
        }
      } else if (req.user.role === 'staff') {
        // Staff can only see assigned complaints or complaints in their department
        if (
          req.user.id !== complaint.assignedToId &&
          complaint.departmentId !== req.user.departmentId
        ) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else if (req.user.role === 'complainant') {
        // Complainants can only see their own complaints
        if (req.user.id !== complaint.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(complaint);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async updateComplaintStatus(req, res) {
    try {
      const { status, comment } = req.body;
      
      // Prepare files data if provided
      const files = req.files || [];
      const fileData = files.map(file => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size
      }));

      const complaint = await complaintService.updateComplaintStatus(
        req.params.id,
        status,
        comment,
        req.user.id,
        fileData,
        req.user
      );

      res.json({
        message: 'Complaint status updated',
        complaint
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async assignComplaint(req, res) {
    try {
      const { staffId } = req.body;
      const complaint = await complaintService.assignComplaint(
        req.params.id,
        staffId,
        req.user.id,
        req.user
      );

      res.json({
        message: 'Complaint assigned successfully',
        complaint
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async addFeedback(req, res) {
    try {
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const feedback = await complaintService.addFeedback(
        req.params.id,
        req.user.id,
        rating,
        comment
      );

      res.status(201).json({
        message: 'Feedback added successfully',
        feedback
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getStaff(req, res) {
    try {
      // Get staff members - restrict to department for managers
      const where = {
        role: 'staff',
        isActive: true
      };

      // Department managers only see their department's staff
      if (req.user.role === 'department_manager') {
        where.departmentId = req.user.departmentId;
      }

      const staff = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          department: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      res.json({
        message: 'Staff fetched successfully',
        data: staff
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          department: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      res.json({
        message: 'Categories fetched successfully',
        data: categories
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAttachments(req, res) {
    try {
      const attachments = await prisma.attachment.findMany({
        where: {
          complaintId: req.params.id
        },
        select: {
          id: true,
          filePath: true,
          fileType: true,
          fileSize: true,
          uploadedBy: true,
          uploadedAt: true
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });

      res.json({
        message: 'Attachments fetched successfully',
        data: attachments
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async downloadAttachment(req, res) {
    try {
      const attachment = await prisma.attachment.findUnique({
        where: {
          id: req.params.attachmentId
        }
      });

      if (!attachment) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      // Check if file exists
      if (!fs.existsSync(attachment.filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Send file
      res.download(attachment.filePath);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async downloadStatusUpdateFile(req, res) {
    try {
      const file = await prisma.statusUpdateFile.findUnique({
        where: {
          id: req.params.fileId
        }
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Check if file exists
      if (!fs.existsSync(file.filePath)) {
        return res.status(404).json({ error: 'File not found on server' });
      }

      // Send file
      res.download(file.filePath);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async addComment(req, res) {
    try {
      const { comment } = req.body;

      // Verify complaint exists
      const complaint = await prisma.complaint.findUnique({
        where: { id: req.params.id }
      });

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // For department managers: verify they can only comment on complaints in their department
      if (req.user.role === 'department_manager') {
        if (complaint.departmentId !== req.user.departmentId) {
          return res.status(403).json({ error: 'You can only comment on complaints from your department' });
        }
      }

      // Create comment (stored as special history entry with type='comment')
      const newComment = await prisma.complaintHistory.create({
        data: {
          complaintId: req.params.id,
          status: complaint.status,
          comment: comment,
          updatedBy: req.user.id,
          isInternalNote: true
        },
        include: {
          updatedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      res.json({
        message: 'Comment added successfully',
        data: newComment
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getComments(req, res) {
    try {
      // Additional safety check - only staff, managers, and admins can view internal comments
      const allowedRoles = ['staff', 'department_manager', 'admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied. Only staff and managers can view internal comments.' });
      }

      const comments = await prisma.complaintHistory.findMany({
        where: {
          complaintId: req.params.id,
          isInternalNote: true
        },
        include: {
          updatedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        message: 'Comments fetched successfully',
        data: comments
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async escalateComplaint(req, res) {
    try {
      const { reason } = req.body;

      const complaint = await prisma.complaint.findUnique({
        where: { id: req.params.id }
      });

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // For department managers: verify they can only escalate complaints in their department
      if (req.user.role === 'department_manager') {
        if (complaint.departmentId !== req.user.departmentId) {
          return res.status(403).json({ error: 'You can only escalate complaints from your department' });
        }
      }

      // Update complaint status to Escalated
      const updatedComplaint = await prisma.complaint.update({
        where: { id: req.params.id },
        data: {
          status: 'Escalated'
        },
        include: {
          user: true,
          department: true,
          category: true,
          assignedTo: true,
          history: true,
          attachments: true,
          feedback: true
        }
      });

      // Add escalation to history
      await prisma.complaintHistory.create({
        data: {
          complaintId: req.params.id,
          status: 'Escalated',
          comment: `Escalated: ${reason}`,
          updatedBy: req.user.id
        }
      });

      res.json({
        message: 'Complaint escalated successfully',
        complaint: updatedComplaint
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async reopenComplaint(req, res) {
    try {
      const { reason } = req.body;

      const complaint = await complaintService.reopenComplaint(
        req.params.id,
        req.user.id,
        reason
      );

      res.json({
        message: 'Complaint reopened successfully',
        complaint
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = complaintController;
