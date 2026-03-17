const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationService = {
  async createNotification(data) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        refId: data.refId,
        refType: data.refType,
        isRead: false
      }
    });
  },

  async getNotifications(userId, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  },

  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });
  },

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true }
    });
  }
};

module.exports = notificationService;
