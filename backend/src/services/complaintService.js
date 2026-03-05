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

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: true,
        department: true,
        category: true,
        assignedTo: true,
        history: true,
        attachments: true,
        feedback: true
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 10,
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

  async updateComplaintStatus(complaintId, newStatus, comment, updatedBy, fileData = []) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      throw new Error('Complaint not found');
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

  async assignComplaint(complaintId, staffId, assignedBy) {
    const staff = await prisma.user.findUnique({
      where: { id: staffId }
    });

    if (!staff || staff.role !== 'staff') {
      throw new Error('Invalid staff member');
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId: staffId,
        status: 'Assigned'
      },
      include: { user: true, assignedTo: true }
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

    return complaint;
  },

  async addFeedback(complaintId, userId, rating, comment) {
    const feedback = await prisma.feedback.create({
      data: {
        complaintId,
        userId,
        rating,
        comment
      }
    });

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
