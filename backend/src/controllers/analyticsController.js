const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const analyticsController = {
  async getDashboardStats(req, res) {
    try {
      // Build filter based on user role
      let complaintFilter = {};
      
      if (req.user.role === 'complainant') {
        // Complainants can only see their own complaints
        complaintFilter = { userId: req.user.id };
      } else if (req.user.role === 'department_manager' || req.user.role === 'staff') {
        // Department managers and staff see only their department's complaints
        if (req.user.departmentId) {
          complaintFilter = { departmentId: req.user.departmentId };
        }
      }
      // admin sees all complaints (no filter)

      // Total complaints
      const totalComplaints = await prisma.complaint.count({
        where: complaintFilter
      });

      if (totalComplaints === 0) {
        return res.json({
          totalComplaints: 0,
          byStatus: {},
          byPriority: {},
          averageRating: 0,
          byDepartment: [],
          slaBreaches: 0,
          resolutionRate: '0%',
          userRole: req.user.role
        });
      }

      // By status
      const byStatus = await prisma.complaint.groupBy({
        by: ['status'],
        where: complaintFilter,
        _count: true
      });

      // By priority
      const byPriority = await prisma.complaint.groupBy({
        by: ['priority'],
        where: complaintFilter,
        _count: true
      });

      // Average rating (for user's complaints)
      const avgRating = await prisma.feedback.aggregate({
        where: {
          complaint: complaintFilter
        },
        _avg: { rating: true }
      });

      // Complaints by department
      const byDepartment = await prisma.complaint.groupBy({
        by: ['departmentId'],
        where: complaintFilter,
        _count: true
      });

      // Get department names
      const departments = await prisma.department.findMany();
      const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

      // SLA breaches
      const slaBreaches = await prisma.complaint.count({
        where: {
          ...complaintFilter,
          slaDeadline: { lt: new Date() },
          status: { not: 'Closed' }
        }
      });

      // Resolution rate
      const closedCount = await prisma.complaint.count({
        where: {
          ...complaintFilter,
          status: 'Closed'
        }
      });

      res.json({
        totalComplaints,
        byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])),
        byPriority: Object.fromEntries(byPriority.map(p => [p.priority, p._count])),
        averageRating: avgRating._avg.rating || 0,
        byDepartment: byDepartment.map(d => ({
          department: deptMap[d.departmentId],
          count: d._count
        })),
        slaBreaches,
        resolutionRate: ((closedCount / totalComplaints) * 100).toFixed(2) + '%',
        userRole: req.user.role
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = analyticsController;
