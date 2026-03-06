/**
 * Departments and Categories Configuration
 * This mirrors the backend department structure
 */

export const DEPARTMENTS = {
  INFRASTRUCTURE: 'Infrastructure & Public Works',
  HEALTH: 'Health & Welfare Services',
  EDUCATION: 'Education & Training',
  ENVIRONMENT: 'Environmental Services',
  TRANSPORT: 'Transportation & Traffic',
  FINANCE: 'Municipal Finance & Billing',
  LEGAL: 'Legal & Consumer Affairs',
  HR: 'HR & Administrative Services'
};

export const DEPARTMENT_COLORS = {
  'Infrastructure & Public Works': 'bg-blue-100 text-blue-800',
  'Health & Welfare Services': 'bg-green-100 text-green-800',
  'Education & Training': 'bg-yellow-100 text-yellow-800',
  'Environmental Services': 'bg-emerald-100 text-emerald-800',
  'Transportation & Traffic': 'bg-orange-100 text-orange-800',
  'Municipal Finance & Billing': 'bg-purple-100 text-purple-800',
  'Legal & Consumer Affairs': 'bg-red-100 text-red-800',
  'HR & Administrative Services': 'bg-pink-100 text-pink-800'
};

export const DEPARTMENT_DESCRIPTIONS = {
  'Infrastructure & Public Works': 'Roads, water supply, sewerage, street lighting, and public utilities management',
  'Health & Welfare Services': 'Public health, sanitation, hospitals, clinics, and welfare programs',
  'Education & Training': 'Schools, colleges, skill development, and educational programs',
  'Environmental Services': 'Pollution control, waste management, recycling, and environmental protection',
  'Transportation & Traffic': 'Traffic management, public transport, vehicle registration, and road safety',
  'Municipal Finance & Billing': 'Property taxes, water bills, electricity bills, and financial transactions',
  'Legal & Consumer Affairs': 'Consumer protection, legal grievances, and dispute resolution',
  'HR & Administrative Services': 'Employee grievances, administrative services, and staff complaints'
};

export const DEPARTMENT_CATEGORIES = {
  'Infrastructure & Public Works': [
    { id: 'pothole', name: 'Potholes & Road Damage', priority: 'High' },
    { id: 'water-leak', name: 'Water Leak / Pipes', priority: 'High' },
    { id: 'street-light', name: 'Street Lighting Issues', priority: 'Medium' },
    { id: 'sewerage', name: 'Sewerage & Drainage', priority: 'High' }
  ],
  'Health & Welfare Services': [
    { id: 'hospital', name: 'Hospital Services', priority: 'Critical' },
    { id: 'sanitation', name: 'Sanitation & Hygiene', priority: 'High' }
  ],
  'Education & Training': [
    { id: 'school-infra', name: 'School Infrastructure', priority: 'Medium' },
    { id: 'teacher-issue', name: 'Teacher & Staff Issues', priority: 'Medium' }
  ],
  'Environmental Services': [
    { id: 'pollution', name: 'Pollution & Emissions', priority: 'High' },
    { id: 'waste', name: 'Waste Management', priority: 'Medium' }
  ],
  'Transportation & Traffic': [
    { id: 'traffic-violation', name: 'Traffic Violations', priority: 'Medium' },
    { id: 'public-transport', name: 'Public Transport Issues', priority: 'Medium' }
  ],
  'Municipal Finance & Billing': [
    { id: 'billing', name: 'Incorrect Billing', priority: 'Medium' },
    { id: 'payment', name: 'Payment & Tax Issues', priority: 'Medium' }
  ],
  'Legal & Consumer Affairs': [
    { id: 'consumer', name: 'Consumer Complaint', priority: 'Medium' },
    { id: 'dispute', name: 'Legal Dispute', priority: 'High' }
  ],
  'HR & Administrative Services': [
    { id: 'grievance', name: 'Employee Grievance', priority: 'Medium' },
    { id: 'leave', name: 'Leave & Attendance', priority: 'Low' }
  ]
};

/**
 * Get all department names
 */
export const getDepartmentList = () => {
  return Object.values(DEPARTMENTS);
};

/**
 * Get categories for a specific department
 */
export const getCategories = (departmentName) => {
  return DEPARTMENT_CATEGORIES[departmentName] || [];
};

/**
 * Get category by ID and department
 */
export const getCategory = (departmentName, categoryId) => {
  const categories = getCategories(departmentName);
  return categories.find(cat => cat.id === categoryId);
};

/**
 * Get color badge for department
 */
export const getDepartmentColor = (departmentName) => {
  return DEPARTMENT_COLORS[departmentName] || 'bg-gray-100 text-gray-800';
};

/**
 * Get description for department
 */
export const getDepartmentDescription = (departmentName) => {
  return DEPARTMENT_DESCRIPTIONS[departmentName] || '';
};

/**
 * Identify primary department (Infrastructure - basic/core)
 */
export const isPrimaryDepartment = (departmentName) => {
  return departmentName === DEPARTMENTS.INFRASTRUCTURE;
};
