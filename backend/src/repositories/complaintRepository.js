const prisma = require('../config/database');
const BaseRepository = require('./baseRepository');

/**
 * Complaint Repository
 * 
 * Data access layer for complaint-related database operations.
 * Isolates Prisma queries from business logic.
 * Extends BaseRepository for common CRUD operations.
 */
class ComplaintRepository {
  /**
   * Create a new complaint
   */
  async create(data) {
    return await prisma.complaint.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: true,
        category: true,
      },
    });
  }

  /**
   * Find complaints with filters
   */
  async findMany(filters = {}) {
    const {
      userId,
      departmentId,
      assignedToId,
      status,
      priority,
      limit = 10,
      offset = 0,
    } = filters;

    const where = {};
    if (userId) where.userId = userId;
    if (departmentId) where.departmentId = departmentId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.complaint.count({ where }),
    ]);

    return {
      complaints,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
  }

  /**
   * Find complaint by ID with full details
   */
  async findById(id) {
    return await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        department: true,
        category: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        history: {
          include: {
            updatedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            statusUpdateFiles: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: {
          include: {
            uploadedByUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        feedback: true,
      },
    });
  }

  /**
   * Update complaint
   */
  async update(id, data) {
    return await prisma.complaint.update({
      where: { id },
      data,
      include: {
        user: true,
        department: true,
        category: true,
        assignedTo: true,
      },
    });
  }

  /**
   * Delete complaint (soft delete in future)
   */
  async delete(id) {
    return await prisma.complaint.delete({
      where: { id },
    });
  }

  /**
   * Count complaints by status
   */
  async countByStatus(filters = {}) {
    const where = {};
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.userId) where.userId = filters.userId;

    return await prisma.complaint.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
  }

  /**
   * Count complaints by priority
   */
  async countByPriority(filters = {}) {
    const where = {};
    if (filters.departmentId) where.departmentId = filters.departmentId;

    return await prisma.complaint.groupBy({
      by: ['priority'],
      where,
      _count: true,
    });
  }

  /**
   * Count complaints by department
   */
  async countByDepartment(filters = {}) {
    return await prisma.complaint.groupBy({
      by: ['departmentId'],
      _count: true,
    });
  }

  /**
   * Count SLA breaches
   */
  async countSLABreaches(filters = {}) {
    const where = {
      slaDeadline: {
        lt: new Date(),
      },
      status: {
        notIn: ['Closed', 'Resolved'],
      },
    };

    if (filters.departmentId) where.departmentId = filters.departmentId;

    return await prisma.complaint.count({ where });
  }

  /**
   * Find complaints with SLA breach
   */
  async findSLABreached() {
    return await prisma.complaint.findMany({
      where: {
        slaDeadline: {
          lt: new Date(),
        },
        status: {
          notIn: ['Closed', 'Resolved', 'Escalated'],
        },
      },
      include: {
        user: true,
        assignedTo: true,
        department: true,
      },
    });
  }

  /**
   * Calculate average rating
   */
  async getAverageRating(filters = {}) {
    const where = {};
    if (filters.departmentId) where.complaint = { departmentId: filters.departmentId };

    const result = await prisma.feedback.aggregate({
      where,
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }

  /**
   * Calculate resolution rate
   */
  async getResolutionRate(filters = {}) {
    const where = {};
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.userId) where.userId = filters.userId;

    const [total, resolved] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.count({
        where: {
          ...where,
          status: {
            in: ['Resolved', 'Closed'],
          },
        },
      }),
    ]);

    return total > 0 ? Math.round((resolved / total) * 100) : 0;
  }

  /**
   * Create complaint history entry
   */
  async createHistory(data) {
    return await prisma.complaintHistory.create({
      data,
    });
  }

  /**
   * Create attachment
   */
  async createAttachment(data) {
    return await prisma.attachment.create({
      data,
    });
  }

  /**
   * Create feedback
   */
  async createFeedback(data) {
    return await prisma.feedback.create({
      data,
    });
  }
}

module.exports = new ComplaintRepository();
