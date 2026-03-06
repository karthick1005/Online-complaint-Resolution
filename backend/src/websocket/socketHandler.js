const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

/**
 * Socket.IO Configuration for Real-Time Updates
 * 
 * Events:
 * - complaint_created
 * - complaint_assigned
 * - complaint_status_updated
 * - complaint_escalated
 * - notification_received
 */
class SocketHandler {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  /**
   * Initialize Socket.IO
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.IO initialized');
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const userId = socket.user.id;

    logger.info({
      type: 'socket_connection',
      userId,
      socketId: socket.id,
    });

    // Store connection
    this.connectedUsers.set(userId, socket.id);

    // Join user-specific room
    socket.join(`user-${userId}`);

    // Join role-specific room
    socket.join(`role-${socket.user.role}`);

    // Join department-specific room (if applicable)
    if (socket.user.departmentId) {
      socket.join(`dept-${socket.user.departmentId}`);
    }

    // Handle joining complaint rooms
    socket.on('join-complaint', (complaintId) => {
      socket.join(`complaint-${complaintId}`);
      logger.info(`User ${userId} joined complaint ${complaintId}`);
    });

    // Handle leaving complaint rooms
    socket.on('leave-complaint', (complaintId) => {
      socket.leave(`complaint-${complaintId}`);
      logger.info(`User ${userId} left complaint ${complaintId}`);
    });

    // Handle typing indicators
    socket.on('typing', ({ complaintId }) => {
      socket.to(`complaint-${complaintId}`).emit('user-typing', {
        userId,
        userName: socket.user.name,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.connectedUsers.delete(userId);
      logger.info({
        type: 'socket_disconnection',
        userId,
        socketId: socket.id,
      });
    });
  }

  /**
   * Emit complaint created event
   */
  emitComplaintCreated(complaint) {
    // Notify all staff in the department
    this.io.to(`dept-${complaint.departmentId}`).emit('complaint_created', complaint);

    // Notify admins
    this.io.to('role-admin').emit('complaint_created', complaint);

    logger.info('Emitted complaint_created event', { complaintId: complaint.id });
  }

  /**
   * Emit complaint assigned event
   */
  emitComplaintAssigned(complaint, assignedToId) {
    // Notify assigned staff
    this.io.to(`user-${assignedToId}`).emit('complaint_assigned', complaint);

    // Notify complainant
    this.io.to(`user-${complaint.userId}`).emit('complaint_updated', {
      ...complaint,
      message: 'Your complaint has been assigned',
    });

    // Update complaint room
    this.io.to(`complaint-${complaint.id}`).emit('complaint_status_updated', complaint);

    logger.info('Emitted complaint_assigned event', { complaintId: complaint.id });
  }

  /**
   * Emit status updated event
   */
  emitStatusUpdated(complaint) {
    // Notify complainant
    this.io.to(`user-${complaint.userId}`).emit('complaint_updated', complaint);

    // Notify assigned staff (if any)
    if (complaint.assignedToId) {
      this.io.to(`user-${complaint.assignedToId}`).emit('complaint_updated', complaint);
    }

    // Update all watching the complaint
    this.io.to(`complaint-${complaint.id}`).emit('complaint_status_updated', complaint);

    // Notify department managers
    this.io.to(`dept-${complaint.departmentId}`).emit('complaint_updated', complaint);

    logger.info('Emitted complaint_status_updated event', { complaintId: complaint.id });
  }

  /**
   * Emit escalation event
   */
  emitComplaintEscalated(complaint) {
    // Notify all managers and admins
    this.io.to('role-admin').emit('complaint_escalated', complaint);
    this.io.to('role-department_manager').emit('complaint_escalated', complaint);

    // Notify complainant
    this.io.to(`user-${complaint.userId}`).emit('complaint_escalated', complaint);

    logger.info('Emitted complaint_escalated event', { complaintId: complaint.id });
  }

  /**
   * Send notification to user
   */
  sendNotification(userId, notification) {
    this.io.to(`user-${userId}`).emit('notification_received', notification);
  }

  /**
   * Broadcast system message
   */
  broadcastSystemMessage(message) {
    this.io.emit('system_message', message);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketHandler();
