const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding notifications for Admin user...');

  // Find the admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (!admin) {
    console.error('❌ Admin user not found. Please run the main seed first.');
    return;
  }

  console.log(`Found Admin: ${admin.email} (ID: ${admin.id})`);

  // Clear existing notifications for this admin to avoid duplicates if needed
  // await prisma.notification.deleteMany({ where: { userId: admin.id } });

  const notifications = [
    {
      userId: admin.id,
      title: 'New Complaint Registered',
      message: 'A new high-priority complaint has been registered in the Infrastructure department.',
      type: 'complaint_update',
      isRead: false,
      refType: 'Complaint',
      createdAt: new Date()
    },
    {
      userId: admin.id,
      title: 'SLA Breach Warning',
      message: 'Complaint #CMP-1024 is approaching its SLA deadline.',
      type: 'system',
      isRead: false,
      refType: 'Complaint',
      createdAt: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      userId: admin.id,
      title: 'System Update',
      message: 'The system will undergo maintenance tonight at 11 PM.',
      type: 'system',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      userId: admin.id,
      title: 'Feedback Received',
      message: 'A user has provided 5-star feedback for a recently closed complaint.',
      type: 'comment',
      isRead: false,
      createdAt: new Date(Date.now() - 1800000) // 30 mins ago
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification
    });
  }

  console.log(`✅ Successfully seeded ${notifications.length} notifications for admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
