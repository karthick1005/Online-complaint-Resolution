const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (order matters due to foreign key constraints)
  await prisma.feedback.deleteMany();
  await prisma.statusUpdateFile.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.complaintHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Create departments
  const deptWater = await prisma.department.create({
    data: {
      name: 'Water Supply',
      description: 'Water and sewerage complaints'
    }
  });

  const deptRoads = await prisma.department.create({
    data: {
      name: 'Roads & Infrastructure',
      description: 'Road maintenance and construction'
    }
  });

  const deptPower = await prisma.department.create({
    data: {
      name: 'Power Supply',
      description: 'Electricity and power distribution'
    }
  });

  // Create categories
  const catLeak = await prisma.category.create({
    data: {
      name: 'Water Leak',
      departmentId: deptWater.id,
      defaultPriority: 'High'
    }
  });

  const catPothole = await prisma.category.create({
    data: {
      name: 'Pothole',
      departmentId: deptRoads.id,
      defaultPriority: 'Medium'
    }
  });

  const catOutage = await prisma.category.create({
    data: {
      name: 'Power Outage',
      departmentId: deptPower.id,
      defaultPriority: 'High'
    }
  });

  // Create users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@complaintresolution.com',
      phone: '9876543210',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true
    }
  });

  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const manager = await prisma.user.create({
    data: {
      name: 'Department Manager',
      email: 'manager@complaintresolution.com',
      phone: '9876543211',
      passwordHash: managerPassword,
      role: 'department_manager',
      departmentId: deptWater.id,
      isActive: true
    }
  });

  const staffPassword = await bcrypt.hash('Staff@123', 10);
  const staff = await prisma.user.create({
    data: {
      name: 'Staff Member',
      email: 'staff@complaintresolution.com',
      phone: '9876543212',
      passwordHash: staffPassword,
      role: 'staff',
      departmentId: deptWater.id,
      isActive: true
    }
  });

  const complainantPassword = await bcrypt.hash('User@123', 10);
  const complainant = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@example.com',
      phone: '9876543213',
      passwordHash: complainantPassword,
      role: 'complainant',
      isActive: true
    }
  });

  // Create sample complaints
  const complaint1 = await prisma.complaint.create({
    data: {
      complaintCode: 'CMP-' + Date.now() + '-001',
      userId: complainant.id,
      departmentId: deptWater.id,
      categoryId: catLeak.id,
      title: 'Water pipe leaking in street',
      description: 'Large water pipe burst on Main Street causing wastage',
      priority: 'High',
      status: 'Assigned',
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Main Street, City Center',
      assignedToId: staff.id,
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      complaintCode: 'CMP-' + Date.now() + '-002',
      userId: complainant.id,
      departmentId: deptRoads.id,
      categoryId: catPothole.id,
      title: 'Large pothole on Road No. 5',
      description: 'Dangerous pothole causing damage to vehicles',
      priority: 'Medium',
      status: 'Registered',
      latitude: 28.6200,
      longitude: 77.2150,
      address: 'Road No. 5, Sector 12',
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000)
    }
  });

  // Add complaint history
  await prisma.complaintHistory.create({
    data: {
      complaintId: complaint1.id,
      status: 'Registered',
      comment: 'Complaint registered successfully',
      updatedBy: admin.id
    }
  });

  await prisma.complaintHistory.create({
    data: {
      complaintId: complaint1.id,
      status: 'Assigned',
      comment: 'Assigned to field staff for inspection',
      updatedBy: manager.id
    }
  });

  // Add feedback
  await prisma.feedback.create({
    data: {
      complaintId: complaint1.id,
      userId: complainant.id,
      rating: 4,
      comment: 'Good response time'
    }
  });

  console.log('✅ Database seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin:', admin.email, '/ Admin@123');
  console.log('Manager:', manager.email, '/ Manager@123');
  console.log('Staff:', staff.email, '/ Staff@123');
  console.log('User:', complainant.email, '/ User@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
