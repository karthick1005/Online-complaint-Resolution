const cron = require('node-cron');
const prisma = require('../config/database');
const { sendEmail, emailTemplates } = require('../utils/emailService');
const { logger } = require('../utils/logger');

// Check SLA breaches every hour
const slaEscalationJob = cron.schedule('0 * * * *', async () => {
  try {
    const breachedComplaints = await prisma.complaint.findMany({
      where: {
        slaDeadline: { lt: new Date() },
        status: { in: ['Registered', 'Assigned', 'InProgress'] }
      },
      include: { user: true, assignedTo: true }
    });

    for (const complaint of breachedComplaints) {
      // Update status to Escalated
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: 'Escalated' }
      });

      // Add history
      await prisma.complaintHistory.create({
        data: {
          complaintId: complaint.id,
          status: 'Escalated',
          comment: 'Auto-escalated due to SLA breach',
          updatedBy: complaint.assignedToId || complaint.userId
        }
      });

      // Send escalation email
      sendEmail(
        complaint.user.email,
        '⚠️ Complaint Escalated - SLA Breach',
        `<h2>Your complaint ${complaint.complaintCode} has been escalated due to SLA deadline breach.</h2>`
      );

      if (complaint.assignedTo) {
        sendEmail(
          complaint.assignedTo.email,
          '⚠️ Complaint Escalated - SLA Breach',
          `<h2>Complaint ${complaint.complaintCode} assigned to you has been escalated.</h2>`
        );
      }
    }

    logger.info({
      message: 'SLA breach scan completed',
      breachedComplaintCount: breachedComplaints.length,
    });
  } catch (error) {
    logger.error({
      message: 'SLA escalation job error',
      error: error.message,
      stack: error.stack,
    });
  }
});

module.exports = {
  slaEscalationJob
};
