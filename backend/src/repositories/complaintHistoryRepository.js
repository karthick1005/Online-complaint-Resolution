const prisma = require('../config/database');
const BaseRepository = require('./baseRepository');

/**
 * Complaint History Repository
 * 
 * Tracks all status changes and notes for complaints
 */
class ComplaintHistoryRepository extends BaseRepository {
  constructor() {
    super(prisma.complaintHistory);
  }

  /**
   * Create history entry with files
   */
  async createWithFiles(historyData, files = []) {
    return await prisma.complaintHistory.create({
      data: {
        ...historyData,
        statusUpdateFiles: files.length > 0 ? {
          create: files,
        } : undefined,
      },
      include: {
        updatedByUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        statusUpdateFiles: true,
      },
    });
  }

  /**
   * Find history for a complaint (public only)
   */
  async findByComplaintId(complaintId, includeInternal = false) {
    const where = { complaintId };
    if (!includeInternal) {
      where.isInternalNote = false;
    }

    return await this.findAll({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        updatedByUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        statusUpdateFiles: {
          select: {
            id: true,
            filePath: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
      },
    });
  }

  /**
   * Create internal note
   */
  async createInternalNote(complaintId, comment, updatedBy) {
    return await this.create({
      complaintId,
      status: 'Note', // Internal status
      comment,
      updatedBy,
      isInternalNote: true,
    });
  }

  /**
   * Get latest status update
   */
  async getLatestUpdate(complaintId) {
    return await prisma.complaintHistory.findFirst({
      where: { complaintId },
      orderBy: { createdAt: 'desc' },
      include: {
        updatedByUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Count updates by status
   */
  async countByStatus(complaintId) {
    const history = await this.findAll({
      where: { complaintId },
      select: {
        status: true,
      },
    });

    return history.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Get complaint timeline with complete details
   */
  async getCompleteTimeline(complaintId) {
    return await prisma.complaintHistory.findMany({
      where: { complaintId },
      orderBy: { createdAt: 'desc' },
      include: {
        updatedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        statusUpdateFiles: true,
      },
    });
  }
}

module.exports = new ComplaintHistoryRepository();
