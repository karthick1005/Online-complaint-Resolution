const prisma = require('../config/database');
const BaseRepository = require('./baseRepository');

/**
 * Feedback Repository
 * 
 * Handles complaint feedback and ratings
 */
class FeedbackRepository extends BaseRepository {
  constructor() {
    super(prisma.feedback);
  }

  /**
   * Find feedback by complaint ID
   */
  async findByComplaintId(complaintId) {
    return await this.findOne(
      { complaintId },
      {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }
    );
  }

  /**
   * Get average rating for a specific user (staff)
   */
  async getAverageRatingForUser(userId) {
    // Find all complaints assigned to this user with feedback
    const complaints = await prisma.complaint.findMany({
      where: {
        assignedToId: userId,
        feedback: {
          isNot: null,
        },
      },
      include: {
        feedback: true,
      },
    });

    if (complaints.length === 0) {
      return { average: 0, count: 0 };
    }

    const totalRating = complaints.reduce((sum, c) => sum + c.feedback.rating, 0);
    return {
      average: totalRating / complaints.length,
      count: complaints.length,
    };
  }

  /**
   * Get average rating across all complaints
   */
  async getOverallAverageRating() {
    const result = await prisma.feedback.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      average: result._avg.rating || 0,
      count: result._count.rating || 0,
    };
  }

  /**
   * Get feedback statistics by department
   */
  async getStatsByDepartment(departmentId) {
    const complaints = await prisma.complaint.findMany({
      where: {
        departmentId,
        feedback: {
          isNot: null,
        },
      },
      include: {
        feedback: true,
      },
    });

    if (complaints.length === 0) {
      return { average: 0, count: 0, distribution: {} };
    }

    const totalRating = complaints.reduce((sum, c) => sum + c.feedback.rating, 0);
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    complaints.forEach((c) => {
      distribution[c.feedback.rating]++;
    });

    return {
      average: totalRating / complaints.length,
      count: complaints.length,
      distribution,
    };
  }
}

module.exports = new FeedbackRepository();
