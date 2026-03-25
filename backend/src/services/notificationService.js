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
    const includeUnreadCount =
      options.includeUnreadCount === true || options.includeUnreadCount === 'true';
    const where = {
      userId,
      ...(options.unreadOnly === 'true' ? { isRead: false } : {})
    };

    const queries = [
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.notification.count({ where })
    ];

    if (includeUnreadCount && options.unreadOnly !== 'true') {
      queries.push(
        prisma.notification.count({
          where: {
            userId,
            isRead: false,
          }
        })
      );
    }

    const [notifications, totalItems, unreadCount] = await prisma.$transaction(queries);

    const pagination = buildPaginationMeta({
      page,
      pageSize,
      totalItems,
    });

    if (typeof unreadCount === 'number') {
      pagination.unreadCount = unreadCount;
    }

    return {
      data: notifications,
      pagination
    };
  },

  async getUnreadCount(userId) {
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      }
    });

    return { unreadCount };
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
