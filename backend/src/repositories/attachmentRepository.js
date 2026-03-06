const prisma = require('../config/database');
const BaseRepository = require('./baseRepository');

/**
 * Attachment Repository
 * 
 * Handles file attachment operations for complaints
 */
class AttachmentRepository extends BaseRepository {
  constructor() {
    super(prisma.attachment);
  }

  /**
   * Create multiple attachments for a complaint
   */
  async createMany(attachments) {
    return await prisma.attachment.createMany({
      data: attachments,
    });
  }

  /**
   * Find attachments by complaint ID
   */
  async findByComplaintId(complaintId) {
    return await this.findAll({
      where: { complaintId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploadedByUser: {
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
   * Delete attachment with file path info
   */
  async deleteWithPath(id) {
    const attachment = await this.findById(id);
    if (attachment) {
      await this.delete(id);
      return attachment.filePath; // Return path for file system deletion
    }
    return null;
  }

  /**
   * Get total attachment size for a complaint
   */
  async getTotalSize(complaintId) {
    const result = await prisma.attachment.aggregate({
      where: { complaintId },
      _sum: {
        fileSize: true,
      },
    });
    return result._sum.fileSize || 0;
  }

  /**
   * Count attachments for a complaint
   */
  async countByComplaint(complaintId) {
    return await this.count({ complaintId });
  }
}

module.exports = new AttachmentRepository();
