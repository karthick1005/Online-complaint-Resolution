const generateComplaintCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `CMP-${timestamp}-${random}`;
};

const calculateSLADeadline = (priority) => {
  const now = new Date();
  const slaHours = {
    'Critical': 4,
    'High': 24,
    'Medium': 48,
    'Low': 72
  };

  const hours = slaHours[priority] || 48;
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};

module.exports = {
  generateComplaintCode,
  calculateSLADeadline
};
