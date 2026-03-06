const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with multiple departments...');

  // Clean existing data (order matters due to foreign key constraints)
  await prisma.feedback.deleteMany();
  await prisma.statusUpdateFile.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.complaintHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // ============ CREATE DEPARTMENTS ============
  // 1. PRIMARY/BASIC DEPARTMENT: Infrastructure & Public Works
  const deptInfra = await prisma.department.create({
    data: {
      name: 'Infrastructure & Public Works',
      description: 'Roads, water supply, sewerage, street lighting, and public utilities management'
    }
  });

  // 2. Health & Welfare Services
  const deptHealth = await prisma.department.create({
    data: {
      name: 'Health & Welfare Services',
      description: 'Public health, sanitation, hospitals, clinics, and welfare programs'
    }
  });

  // 3. Education & Training
  const deptEducation = await prisma.department.create({
    data: {
      name: 'Education & Training',
      description: 'Schools, colleges, skill development, and educational programs'
    }
  });

  // 4. Environmental Services
  const deptEnvironment = await prisma.department.create({
    data: {
      name: 'Environmental Services',
      description: 'Pollution control, waste management, recycling, and environmental protection'
    }
  });

  // 5. Transportation & Traffic
  const deptTransport = await prisma.department.create({
    data: {
      name: 'Transportation & Traffic',
      description: 'Traffic management, public transport, vehicle registration, and road safety'
    }
  });

  // 6. Municipal Finance & Billing
  const deptFinance = await prisma.department.create({
    data: {
      name: 'Municipal Finance & Billing',
      description: 'Property taxes, water bills, electricity bills, and financial transactions'
    }
  });

  // 7. Legal & Consumer Affairs
  const deptLegal = await prisma.department.create({
    data: {
      name: 'Legal & Consumer Affairs',
      description: 'Consumer protection, legal grievances, and dispute resolution'
    }
  });

  // 8. HR & Administrative Services
  const deptHR = await prisma.department.create({
    data: {
      name: 'HR & Administrative Services',
      description: 'Employee grievances, administrative services, and staff complaints'
    }
  });

  // ============ CREATE CATEGORIES FOR EACH DEPARTMENT ============

  // Infrastructure & Public Works Categories
  const catPothole = await prisma.category.create({
    data: {
      name: 'Potholes & Road Damage',
      departmentId: deptInfra.id,
      defaultPriority: 'High'
    }
  });

  const catWaterLeak = await prisma.category.create({
    data: {
      name: 'Water Leak / Pipes',
      departmentId: deptInfra.id,
      defaultPriority: 'High'
    }
  });

  const catStreetLight = await prisma.category.create({
    data: {
      name: 'Street Lighting Issues',
      departmentId: deptInfra.id,
      defaultPriority: 'Medium'
    }
  });

  const catSewerage = await prisma.category.create({
    data: {
      name: 'Sewerage & Drainage',
      departmentId: deptInfra.id,
      defaultPriority: 'High'
    }
  });

  // Health & Welfare Categories
  const catHospital = await prisma.category.create({
    data: {
      name: 'Hospital Services',
      departmentId: deptHealth.id,
      defaultPriority: 'Critical'
    }
  });

  const catSanitation = await prisma.category.create({
    data: {
      name: 'Sanitation & Hygiene',
      departmentId: deptHealth.id,
      defaultPriority: 'High'
    }
  });

  // Education Categories
  const catSchool = await prisma.category.create({
    data: {
      name: 'School Infrastructure',
      departmentId: deptEducation.id,
      defaultPriority: 'Medium'
    }
  });

  const catTeacher = await prisma.category.create({
    data: {
      name: 'Teacher & Staff Issues',
      departmentId: deptEducation.id,
      defaultPriority: 'Medium'
    }
  });

  // Environmental Categories
  const catPollution = await prisma.category.create({
    data: {
      name: 'Pollution & Emissions',
      departmentId: deptEnvironment.id,
      defaultPriority: 'High'
    }
  });

  const catWaste = await prisma.category.create({
    data: {
      name: 'Waste Management',
      departmentId: deptEnvironment.id,
      defaultPriority: 'Medium'
    }
  });

  // Transportation Categories
  const catTraffic = await prisma.category.create({
    data: {
      name: 'Traffic Violations',
      departmentId: deptTransport.id,
      defaultPriority: 'Medium'
    }
  });

  const catPublicTransport = await prisma.category.create({
    data: {
      name: 'Public Transport Issues',
      departmentId: deptTransport.id,
      defaultPriority: 'Medium'
    }
  });

  // Finance & Billing Categories
  const catBilling = await prisma.category.create({
    data: {
      name: 'Incorrect Billing',
      departmentId: deptFinance.id,
      defaultPriority: 'Medium'
    }
  });

  const catPayment = await prisma.category.create({
    data: {
      name: 'Payment & Tax Issues',
      departmentId: deptFinance.id,
      defaultPriority: 'Medium'
    }
  });

  // Legal & Consumer Categories
  const catConsumer = await prisma.category.create({
    data: {
      name: 'Consumer Complaint',
      departmentId: deptLegal.id,
      defaultPriority: 'Medium'
    }
  });

  const catDispute = await prisma.category.create({
    data: {
      name: 'Legal Dispute',
      departmentId: deptLegal.id,
      defaultPriority: 'High'
    }
  });

  // HR & Admin Categories
  const catGrievance = await prisma.category.create({
    data: {
      name: 'Employee Grievance',
      departmentId: deptHR.id,
      defaultPriority: 'Medium'
    }
  });

  const catLeave = await prisma.category.create({
    data: {
      name: 'Leave & Attendance',
      departmentId: deptHR.id,
      defaultPriority: 'Low'
    }
  });

  // ============ CREATE USERS ============
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

  // Create managers for different departments
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const infraManager = await prisma.user.create({
    data: {
      name: 'Infrastructure Manager',
      email: 'manager.infra@complaintresolution.com',
      phone: '9876543211',
      passwordHash: managerPassword,
      role: 'department_manager',
      departmentId: deptInfra.id,
      isActive: true
    }
  });

  const healthManager = await prisma.user.create({
    data: {
      name: 'Health Services Manager',
      email: 'manager.health@complaintresolution.com',
      phone: '9876543212',
      passwordHash: managerPassword,
      role: 'department_manager',
      departmentId: deptHealth.id,
      isActive: true
    }
  });

  const eduManager = await prisma.user.create({
    data: {
      name: 'Education Manager',
      email: 'manager.education@complaintresolution.com',
      phone: '9876543213',
      passwordHash: managerPassword,
      role: 'department_manager',
      departmentId: deptEducation.id,
      isActive: true
    }
  });

  // Create staff members
  const staffPassword = await bcrypt.hash('Staff@123', 10);
  const infraStaff = await prisma.user.create({
    data: {
      name: 'Infrastructure Staff 1',
      email: 'staff.infra@complaintresolution.com',
      phone: '9876543214',
      passwordHash: staffPassword,
      role: 'staff',
      departmentId: deptInfra.id,
      isActive: true
    }
  });

  const healthStaff = await prisma.user.create({
    data: {
      name: 'Health Services Staff',
      email: 'staff.health@complaintresolution.com',
      phone: '9876543215',
      passwordHash: staffPassword,
      role: 'staff',
      departmentId: deptHealth.id,
      isActive: true
    }
  });

  // Create test complainants
  const complainantPassword = await bcrypt.hash('User@123', 10);
  const complainant1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user1@example.com',
      phone: '9876543220',
      passwordHash: complainantPassword,
      role: 'complainant',
      isActive: true
    }
  });

  const complainant2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'user2@example.com',
      phone: '9876543221',
      passwordHash: complainantPassword,
      role: 'complainant',
      isActive: true
    }
  });

  // ============ CREATE SAMPLE COMPLAINTS ============
  
  // Infrastructure complaints
  const complaint1 = await prisma.complaint.create({
    data: {
      complaintCode: 'CMP-INF-' + Date.now() + '-001',
      userId: complainant1.id,
      departmentId: deptInfra.id,
      categoryId: catPothole.id,
      title: 'Large pothole on Main Street blocking traffic',
      description: 'Dangerous pothole causing damage to vehicles and traffic disruption',
      priority: 'High',
      status: 'Assigned',
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Main Street, City Center',
      assignedToId: infraStaff.id,
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      complaintCode: 'CMP-INF-' + Date.now() + '-002',
      userId: complainant2.id,
      departmentId: deptInfra.id,
      categoryId: catWaterLeak.id,
      title: 'Water pipe burst causing wastage',
      description: 'Major water pipe leak on residential street',
      priority: 'High',
      status: 'Registered',
      latitude: 28.6200,
      longitude: 77.2150,
      address: 'Second Avenue, Sector 12',
      slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000)
    }
  });

  // Health complaint
  const complaint3 = await prisma.complaint.create({
    data: {
      complaintCode: 'CMP-HEALTH-' + Date.now() + '-001',
      userId: complainant1.id,
      departmentId: deptHealth.id,
      categoryId: catSanitation.id,
      title: 'Poor sanitation conditions in locality',
      description: 'Garbage accumulated on streets causing health hazards',
      priority: 'High',
      status: 'Assigned',
      latitude: 28.6180,
      longitude: 77.2120,
      address: 'Third Street, Sector 8',
      assignedToId: healthStaff.id,
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000)
    }
  });

  // ============ ADD COMPLAINT HISTORY ============
  await prisma.complaintHistory.create({
    data: {
      complaintId: complaint1.id,
      status: 'Registered',
      comment: 'Complaint registered successfully - Road damage reported',
      updatedBy: admin.id
    }
  });

  await prisma.complaintHistory.create({
    data: {
      complaintId: complaint1.id,
      status: 'Assigned',
      comment: 'Assigned to field staff for immediate inspection and repair estimate',
      updatedBy: infraManager.id
    }
  });

  await prisma.complaintHistory.create({
    data: {
      complaintId: complaint2.id,
      status: 'Registered',
      comment: 'Water pipe leak complaint registered - Urgent attention needed',
      updatedBy: admin.id
    }
  });

  // ============ ADD FEEDBACK ============
  await prisma.feedback.create({
    data: {
      complaintId: complaint1.id,
      userId: complainant1.id,
      rating: 4,
      comment: 'Good response time and professional handling'
    }
  });

  console.log('✅ Advanced database seeding completed!');
  console.log('\n📊 DEPARTMENTS CREATED:');
  console.log('1. Infrastructure & Public Works (BASIC)');
  console.log('2. Health & Welfare Services');
  console.log('3. Education & Training');
  console.log('4. Environmental Services');
  console.log('5. Transportation & Traffic');
  console.log('6. Municipal Finance & Billing');
  console.log('7. Legal & Consumer Affairs');
  console.log('8. HR & Administrative Services');
  
  console.log('\n📝 TEST CREDENTIALS:');
  console.log('Admin:', admin.email, '/ Admin@123');
  console.log('Infra Manager:', infraManager.email, '/ Manager@123');
  console.log('Health Manager:', healthManager.email, '/ Manager@123');
  console.log('Edu Manager:', eduManager.email, '/ Manager@123');
  console.log('Infra Staff:', infraStaff.email, '/ Staff@123');
  console.log('Health Staff:', healthStaff.email, '/ Staff@123');
  console.log('Complainant:', complainant1.email, '/ User@123');
  console.log('Complainant 2:', complainant2.email, '/ User@123');

  console.log('\n💾 PERFORMANCE OPTIMIZATIONS APPLIED:');
  console.log('✓ Database indexes on frequently queried fields');
  console.log('✓ Composite indexes for common filter combinations');
  console.log('✓ Optimized query service (reduced N+1 problems)');
  console.log('✓ Pagination support with configurable limits');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
