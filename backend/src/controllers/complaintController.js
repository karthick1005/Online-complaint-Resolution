const prisma = require('../config/database');
const complaintService = require('../services/complaintService');
const { getLocationInfo } = require('../utils/geoLocation');
const multer = require('multer');
const fs = require('fs');
const { sendSuccess } = require('../utils/apiResponse');
const { getPagination } = require('../utils/pagination');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/errors');

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
    return;
  }

  cb(new BadRequestError('Invalid file type'));
};

const upload = multer({
  storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 10485760 },
  fileFilter
});

const complaintController = {
  uploadMiddleware: upload.array('files', 5),

  async createComplaint(req, res) {
    const { title, description, categoryId, priority, latitude, longitude, address } = req.body;
    const locationInfo = await getLocationInfo(req, latitude, longitude);

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

    if (req.files?.length) {
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

    sendSuccess(res, {
      statusCode: 201,
      message: 'Complaint created successfully',
      data: {
        complaint,
        locationDetected: locationInfo.source,
        locationInfo: {
          source: locationInfo.source,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude
        }
      }
    });
  },

  async getComplaints(req, res) {
    const { status, priority, departmentId, search } = req.query;
    const filters = {
      ...getPagination(req.query),
      search,
    };

    switch (req.user.role) {
      case 'complainant':
        filters.userId = req.user.id;
        break;
      case 'staff':
        filters.assignedToId = req.user.id;
        break;
      case 'department_manager':
        filters.departmentId = req.user.departmentId;
        break;
      case 'admin':
        break;
      default:
        throw new ForbiddenError('Invalid user role');
    }

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (departmentId && req.user.role === 'admin') {
      filters.departmentId = departmentId;
    }

    const result = await complaintService.getComplaints(filters);
    sendSuccess(res, result);
  },

  async getComplaintById(req, res) {
    const complaint = await complaintService.getComplaintById(req.params.id);

    if (req.user.role === 'admin') {
      sendSuccess(res, { data: complaint });
      return;
    }

    if (req.user.role === 'department_manager' && complaint.departmentId !== req.user.departmentId) {
      throw new ForbiddenError('Access denied - not your department');
    }

    if (
      req.user.role === 'staff' &&
      req.user.id !== complaint.assignedToId &&
      complaint.departmentId !== req.user.departmentId
    ) {
      throw new ForbiddenError('Access denied');
    }

    if (req.user.role === 'complainant' && req.user.id !== complaint.userId) {
      throw new ForbiddenError('Access denied');
    }

    if (!['department_manager', 'staff', 'complainant'].includes(req.user.role)) {
      throw new ForbiddenError('Access denied');
    }

    sendSuccess(res, { data: complaint });
  },

  async updateComplaintStatus(req, res) {
    const { status, comment } = req.body;
    const fileData = (req.files || []).map((file) => ({
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

    sendSuccess(res, {
      message: 'Complaint status updated',
      data: complaint,
    });
  },

  async assignComplaint(req, res) {
    const complaint = await complaintService.assignComplaint(
      req.params.id,
      req.body.staffId,
      req.user.id,
      req.user
    );

    sendSuccess(res, {
      message: 'Complaint assigned successfully',
      data: complaint,
    });
  },

  async addFeedback(req, res) {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestError('Rating must be between 1 and 5');
    }

    const feedback = await complaintService.addFeedback(
      req.params.id,
      req.user.id,
      rating,
      comment
    );

    sendSuccess(res, {
      statusCode: 201,
      message: 'Feedback added successfully',
      data: feedback,
    });
  },

  async getStaff(req, res) {
    const where = {
      role: 'staff',
      isActive: true
    };

    if (req.user.role === 'department_manager') {
      where.departmentId = req.user.departmentId;
    }
    if (req.user.role === 'admin') {
      where.departmentId = req.query.departmentId || undefined;
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

    sendSuccess(res, {
      message: 'Staff fetched successfully',
      data: staff,
    });
  },

  async getCategories(req, res) {
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

    sendSuccess(res, {
      message: 'Categories fetched successfully',
      data: categories,
    });
  },

  async getAttachments(req, res) {
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

    sendSuccess(res, {
      message: 'Attachments fetched successfully',
      data: attachments,
    });
  },

  async downloadAttachment(req, res) {
    const attachment = await prisma.attachment.findUnique({
      where: {
        id: req.params.attachmentId
      }
    });

    if (!attachment) {
      throw new NotFoundError('Attachment');
    }
    if (!fs.existsSync(attachment.filePath)) {
      throw new NotFoundError('File');
    }

    res.download(attachment.filePath);
  },

  async downloadStatusUpdateFile(req, res) {
    const file = await prisma.statusUpdateFile.findUnique({
      where: {
        id: req.params.fileId
      }
    });

    if (!file) {
      throw new NotFoundError('File');
    }
    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundError('File');
    }

    res.download(file.filePath);
  },

  async addComment(req, res) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id }
    });

    if (!complaint) {
      throw new NotFoundError('Complaint');
    }
    if (req.user.role === 'department_manager' && complaint.departmentId !== req.user.departmentId) {
      throw new ForbiddenError('You can only comment on complaints from your department');
    }

    const newComment = await prisma.complaintHistory.create({
      data: {
        complaintId: req.params.id,
        status: complaint.status,
        comment: req.body.comment,
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

    sendSuccess(res, {
      message: 'Comment added successfully',
      data: newComment,
    });
  },

  async getComments(req, res) {
    if (!['staff', 'department_manager', 'admin'].includes(req.user.role)) {
      throw new ForbiddenError('Access denied. Only staff and managers can view internal comments.');
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

    sendSuccess(res, {
      message: 'Comments fetched successfully',
      data: comments,
    });
  },

  async escalateComplaint(req, res) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id }
    });

    if (!complaint) {
      throw new NotFoundError('Complaint');
    }
    if (req.user.role === 'department_manager' && complaint.departmentId !== req.user.departmentId) {
      throw new ForbiddenError('You can only escalate complaints from your department');
    }

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

    await prisma.complaintHistory.create({
      data: {
        complaintId: req.params.id,
        status: 'Escalated',
        comment: `Escalated: ${req.body.reason}`,
        updatedBy: req.user.id
      }
    });

    sendSuccess(res, {
      message: 'Complaint escalated successfully',
      data: updatedComplaint,
    });
  },

  async reopenComplaint(req, res) {
    const complaint = await complaintService.reopenComplaint(
      req.params.id,
      req.user.id,
      req.body.reason
    );

    sendSuccess(res, {
      message: 'Complaint reopened successfully',
      data: complaint,
    });
  }
};

module.exports = complaintController;
