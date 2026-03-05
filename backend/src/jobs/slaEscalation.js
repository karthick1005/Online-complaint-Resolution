const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendEmail, emailTemplates } = require('../utils/emailService');

const prisma = new PrismaClient();

// Check SLA breaches every hour
const slaEscalationJob = cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 Checking SLA breaches...');

    const breachedComplaints = await prisma.complaint.findMany({
      where: {
        slaDeadline: { lt: new Date() },
        status: { not: 'Closed' }
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

    console.log(`✅ SLA check completed. ${breachedComplaints.length} breaches found.`);
  } catch (error) {
    console.error('❌ SLA escalation job error:', error);
  }
});

module.exports = {
  slaEscalationJob
};
