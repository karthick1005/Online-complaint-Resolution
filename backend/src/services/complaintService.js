const { PrismaClient } = require('@prisma/client');
const { generateComplaintCode, calculateSLADeadline } = require('../utils/complaintUtils');
const { sendEmail, emailTemplates } = require('../utils/emailService');

const prisma = new PrismaClient();

const complaintService = {
  async createComplaint(data, userId) {
    // Get category with department info
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      include: { department: true }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const complaintCode = generateComplaintCode();
    const priority = data.priority || category.defaultPriority;
    const slaDeadline = calculateSLADeadline(priority);

    const complaint = await prisma.complaint.create({
      data: {
        complaintCode,
        userId,
        departmentId: category.departmentId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        priority,
        status: 'Registered',
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        slaDeadline
      },
      include: {
        user: true,
        department: true,
        category: true,
        history: true
      }
    });

    // Add to history
    await prisma.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        status: 'Registered',
        comment: 'Complaint registered successfully',
        updatedBy: userId
      }
    });

    // Send email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    sendEmail(
      user.email,
      'Complaint Registered',
      emailTemplates.complaintCreated(complaintCode, data.title)
    );

    return complaint;
  },

  async getComplaints(filters = {}) {
    const where = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;

    // OPTIMIZATION: Minimal select for list view to reduce payload and improve speed
    const complaints = await prisma.complaint.findMany({
      where,
      select: {
        id: true,
        complaintCode: true,
        userId: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        departmentId: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        department: {
          select: { id: true, name: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        attachments: {
          select: { id: true, filePath: true }
        }
        // OPTIMIZATION: Don't include full history in list view
        // OPTIMIZATION: Don't include feedback in list view
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(filters.limit || 10, 100),  // Cap at 100 to prevent abuse
      skip: filters.offset || 0
    });

    const total = await prisma.complaint.count({ where });

    return {
      data: complaints,
      total,
      page: Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
      pageSize: filters.limit || 10
    };
  },

  async getComplaintById(complaintId) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        user: true,
        department: true,
        category: true,
        assignedTo: true,
        history: {
          where: {
            isInternalNote: false  // Exclude internal notes from timeline
          },
          include: { 
            updatedByUser: true,
            files: true  // Include status update files
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true,
        feedback: true
      }
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return complaint;
  },

  async updateComplaintStatus(complaintId, newStatus, comment, updatedBy, fileData = [], updatedByUser = null) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // For department managers: verify they can only update complaints in their department
    if (updatedByUser && updatedByUser.role === 'department_manager') {
      if (complaint.departmentId !== updatedByUser.departmentId) {
        throw new Error('You can only update complaints from your department');
      }
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status: newStatus },
      include: {
        user: true,
        assignedTo: true,
        history: {
          include: { files: true }
        }
      }
    });

    // Add history entry with files
    const historyEntry = await prisma.complaintHistory.create({
      data: {
        complaintId,
        status: newStatus,
        comment,
        updatedBy,
        files: {
          create: fileData
        }
      },
      include: { files: true }
    });

    // Send notification email
    sendEmail(
      complaint.userId,
      'Complaint Status Updated',
      emailTemplates.statusUpdate(complaint.complaintCode, newStatus)
    );

    return updated;
  },

  async assignComplaint(complaintId, staffId, assignedBy, assignedByUser) {
    // Get complaint first
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // For department managers: verify they can only assign within their department
    if (assignedByUser.role === 'department_manager') {
      if (complaint.departmentId !== assignedByUser.departmentId) {
        throw new Error('You can only assign complaints from your department');
      }
    }

    // Get and validate staff member
    const staff = await prisma.user.findUnique({
      where: { id: staffId }
    });

    if (!staff || staff.role !== 'staff') {
      throw new Error('Invalid staff member');
    }

    // For department managers: verify staff is from their department
    if (assignedByUser.role === 'department_manager') {
      if (staff.departmentId !== assignedByUser.departmentId) {
        throw new Error('You can only assign to staff from your department');
      }
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId: staffId,
        status: 'Assigned'
      },
      include: { user: true, assignedTo: true, department: true }
    });

    // Add history
    await prisma.complaintHistory.create({
      data: {
        complaintId,
        status: 'Assigned',
        comment: `Assigned to ${staff.name}`,
        updatedBy: assignedBy
      }
    });

    // Send emails
    sendEmail(
      complaint.user.email,
      'Complaint Assigned',
      emailTemplates.complaintAssigned(complaint.complaintCode, staff.name)
    );

    return updated;
  },

  async addFeedback(complaintId, userId, rating, comment) {
    // Check if feedback already exists for this complaint
    const existingFeedback = await prisma.feedback.findUnique({
      where: { complaintId }
    });

    let feedback;
    if (existingFeedback) {
      // Update existing feedback
      feedback = await prisma.feedback.update({
        where: { complaintId },
        data: {
          user: { connect: { id: userId } },
          rating,
          comment
        }
      });
    } else {
      // Create new feedback
      feedback = await prisma.feedback.create({
        data: {
          complaintId,
          user: { connect: { id: userId } },
          rating,
          comment
        }
      });
    }

    // Update complaint status to Closed if feedback added
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'Closed' }
    });

    return feedback;
  },

  async reopenComplaint(complaintId, userId, reason) {
    // Get current complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        user: true,
        assignedTo: true,
        department: true
      }
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
      throw new Error('Only resolved or closed complaints can be reopened');
    }

    // Update complaint status back to InProgress
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: 'InProgress'
      },
      include: {
        user: true,
        department: true,
        category: true,
        assignedTo: true,
        history: true,
        attachments: true
      }
    });

    // Add reopen history entry
    await prisma.complaintHistory.create({
      data: {
        complaintId,
        status: 'InProgress',
        comment: `Complaint reopened by complainant${reason ? ': ' + reason : ''}`,
        updatedBy: userId
      }
    });

    return updatedComplaint;
  }
};

module.exports = complaintService;
