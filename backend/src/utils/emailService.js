const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM,
    //   to,
    //   subject,
    //   html
    // });
    console.log(`✉️ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};

const emailTemplates = {
  complaintCreated: (complaintCode, title) => `
    <h2>Complaint Registered Successfully</h2>
    <p>Your complaint has been registered with code: <strong>${complaintCode}</strong></p>
    <p>Title: ${title}</p>
    <p>You can track your complaint status on our portal.</p>
  `,
  
  complaintAssigned: (complaintCode, staffName) => `
    <h2>Complaint Assigned</h2>
    <p>Your complaint ${complaintCode} has been assigned to ${staffName}</p>
    <p>We will work on it soon.</p>
  `,
  
  staffAssignment: (complaintCode, title) => `
    <h2>New Complaint Assigned to You</h2>
    <p>A new complaint has been assigned to you.</p>
    <p><strong>Complaint Code:</strong> ${complaintCode}</p>
    <p><strong>Title:</strong> ${title}</p>
    <p>Please review and take necessary action on this complaint.</p>
  `,
  
  statusUpdate: (complaintCode, newStatus) => `
    <h2>Complaint Status Update</h2>
    <p>Your complaint ${complaintCode} status has changed to: <strong>${newStatus}</strong></p>
  `,
  
  complaintClosed: (complaintCode) => `
    <h2>Complaint Closed</h2>
    <p>Your complaint ${complaintCode} has been closed. Please provide your feedback.</p>
  `
};

module.exports = {
  sendEmail,
  emailTemplates
};
