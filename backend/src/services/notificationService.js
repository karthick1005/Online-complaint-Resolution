const prisma = require('../config/database');
const { buildPaginationMeta } = require('../utils/pagination');

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

  async getNotifications(userId, options = {}) {
    const page = Number.parseInt(options.page, 10) > 0 ? Number.parseInt(options.page, 10) : 1;
    const pageSize = Math.min(
      Number.parseInt(options.pageSize || options.limit, 10) > 0
        ? Number.parseInt(options.pageSize || options.limit, 10)
        : 20,
      100
    );
    const skip = (page - 1) * pageSize;
    const where = {
      userId,
      ...(options.unreadOnly === 'true' ? { isRead: false } : {})
    };

    const [notifications, totalItems] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.notification.count({ where })
    ]);

    return {
      data: notifications,
      pagination: buildPaginationMeta({
        page,
        pageSize,
        totalItems,
      })
    };
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
