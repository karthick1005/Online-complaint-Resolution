require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger } = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/security');
const { apiLimiter } = require('./middleware/advancedRateLimiter');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { slaEscalationJob } = require('./jobs/slaEscalation');

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Security headers (apply first)
securityHeaders.forEach((middleware) => app.use(middleware));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (after body parsing)
app.use(requestLogger);


// Static files
app.use('/uploads', express.static('uploads'));


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Complaint Resolution System API',
      version: '1.0.0',
      description: [
        'Production-ready API documentation for the Online Complaint Resolution System.',
        '',
        'Seed data examples:',
        '- Admin: `admin@complaintresolution.com` / `Admin@123`',
        '- Department manager: `manager.infra@complaintresolution.com` / `Manager@123`',
        '- Staff: `staff.infra@complaintresolution.com` / `Staff@123`',
        '- Complainant: `user1@example.com` / `User@123`',
        '',
        'Default seeded departments include Infrastructure & Public Works, Health & Welfare Services, Education & Training, Environmental Services, Transportation & Traffic, Municipal Finance & Billing, Legal & Consumer Affairs, and HR & Administrative Services.',
      ].join('\n'),
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Validation failed' },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
        StandardResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Request completed successfully' },
            data: { type: 'object', additionalProperties: true },
          },
        },
        AuthUser: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxseeduser1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'user1@example.com' },
            role: { type: 'string', example: 'complainant' },
            departmentId: { type: 'string', nullable: true, example: null },
          },
        },
        DepartmentSummary: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxdeptinfra' },
            name: { type: 'string', example: 'Infrastructure & Public Works' },
          },
        },
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxdeptinfra' },
            name: { type: 'string', example: 'Infrastructure & Public Works' },
            description: {
              type: 'string',
              example: 'Roads, water supply, sewerage, street lighting, and public utilities management',
            },
            categories: {
              type: 'array',
              items: { $ref: '#/components/schemas/CategorySummary' },
            },
            _count: {
              type: 'object',
              properties: {
                complaints: { type: 'integer', example: 8 },
                users: { type: 'integer', example: 3 },
              },
            },
          },
        },
        CategorySummary: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxcatpothole' },
            name: { type: 'string', example: 'Potholes & Road Damage' },
            defaultPriority: { type: 'string', example: 'High' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxcatpothole' },
            name: { type: 'string', example: 'Potholes & Road Damage' },
            departmentId: { type: 'string', example: 'clxdeptinfra' },
            defaultPriority: { type: 'string', example: 'High' },
            color: { type: 'string', nullable: true, example: '#F97316' },
            department: { $ref: '#/components/schemas/DepartmentSummary' },
            _count: {
              type: 'object',
              properties: {
                complaints: { type: 'integer', example: 5 },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxmanagerinfra' },
            name: { type: 'string', example: 'Infrastructure Manager' },
            email: { type: 'string', example: 'manager.infra@complaintresolution.com' },
            phone: { type: 'string', nullable: true, example: '9876543211' },
            role: { type: 'string', example: 'department_manager' },
            departmentId: { type: 'string', nullable: true, example: 'clxdeptinfra' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            department: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clxdeptinfra' },
                name: { type: 'string', example: 'Infrastructure & Public Works' },
              },
            },
          },
        },
        ComplaintListItem: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxcmp001' },
            complaintCode: { type: 'string', example: 'CMP-20260324-1001' },
            title: { type: 'string', example: 'Large pothole on Main Road' },
            description: { type: 'string', example: 'The pothole is growing and causing traffic issues.' },
            priority: { type: 'string', example: 'High' },
            status: { type: 'string', example: 'Registered' },
            departmentId: { type: 'string', example: 'clxdeptinfra' },
            assignedToId: { type: 'string', nullable: true, example: 'clxstaffinfra' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clxseeduser1' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'user1@example.com' },
              },
            },
            department: { $ref: '#/components/schemas/DepartmentSummary' },
            assignedTo: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', example: 'clxstaffinfra' },
                name: { type: 'string', example: 'Infrastructure Staff 1' },
                email: { type: 'string', example: 'staff.infra@complaintresolution.com' },
              },
            },
          },
        },
        ComplaintDetail: {
          allOf: [
            { $ref: '#/components/schemas/ComplaintListItem' },
            {
              type: 'object',
              properties: {
                category: { $ref: '#/components/schemas/Category' },
                address: { type: 'string', example: 'Main Road, Ward 12' },
                latitude: { type: 'number', example: 13.0827 },
                longitude: { type: 'number', example: 80.2707 },
                history: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'clxhistory1' },
                      status: { type: 'string', example: 'Registered' },
                      comment: { type: 'string', example: 'Complaint registered successfully' },
                      createdAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
                attachments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'clxatt1' },
                      filePath: { type: 'string', example: 'uploads/road-damage-photo.jpg' },
                      fileType: { type: 'string', example: 'image/jpeg' },
                    },
                  },
                },
                feedback: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    rating: { type: 'integer', example: 5 },
                    comment: { type: 'string', example: 'Issue resolved quickly.' },
                  },
                },
              },
            },
          ],
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxnotif1' },
            title: { type: 'string', example: 'Complaint Registered' },
            message: { type: 'string', example: 'Your complaint #CMP-20260324-1001 has been successfully registered.' },
            type: { type: 'string', example: 'success' },
            isRead: { type: 'boolean', example: false },
            refId: { type: 'string', nullable: true, example: 'clxcmp001' },
            refType: { type: 'string', nullable: true, example: 'complaint' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalComplaints: { type: 'integer', example: 18 },
            byStatus: {
              type: 'object',
              example: { Registered: 4, Assigned: 3, InProgress: 5, Resolved: 4, Closed: 2 },
            },
            byPriority: {
              type: 'object',
              example: { Critical: 2, High: 7, Medium: 6, Low: 3 },
            },
            averageRating: { type: 'number', example: 4.5 },
            byDepartment: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  department: { type: 'string', example: 'Infrastructure & Public Works' },
                  count: { type: 'integer', example: 8 },
                },
              },
            },
            slaBreaches: { type: 'integer', example: 1 },
            resolutionRate: { type: 'string', example: '33.33%' },
            userRole: { type: 'string', example: 'admin' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Request completed successfully' },
            data: {
              type: 'array',
              items: { type: 'object', additionalProperties: true },
            },
            pagination: {
              $ref: '#/components/schemas/PaginationMeta',
            },
          },
        },
      },
      examples: {
        LoginSeedAdmin: {
          summary: 'Seeded admin credentials',
          value: {
            email: 'admin@complaintresolution.com',
            password: 'Admin@123',
          },
        },
        LoginSeedManager: {
          summary: 'Seeded infrastructure manager credentials',
          value: {
            email: 'manager.infra@complaintresolution.com',
            password: 'Manager@123',
          },
        },
        RegisterComplainantExample: {
          summary: 'Register a complainant',
          value: {
            name: 'Jane Citizen',
            email: 'jane.citizen@example.com',
            phone: '9876501234',
            password: 'User@123',
            confirmPassword: 'User@123',
          },
        },
        CreateDepartmentExample: {
          summary: 'Create a seeded-style department',
          value: {
            name: 'Citizen Facilitation Center',
            description: 'Handles walk-in support, public grievance intake, and citizen helpdesk operations',
          },
        },
        CreateCategoryExample: {
          summary: 'Create category under Infrastructure',
          value: {
            name: 'Footpath Damage',
            departmentId: 'clxdeptinfra',
            defaultPriority: 'Medium',
            color: '#F97316',
          },
        },
        CreateManagerExample: {
          summary: 'Create department manager',
          value: {
            name: 'Road Maintenance Manager',
            email: 'manager.roads@example.com',
            phone: '9876512345',
            password: 'Manager@123',
            departmentId: 'clxdeptinfra',
          },
        },
        CreateStaffExample: {
          summary: 'Create staff user',
          value: {
            name: 'Road Inspector',
            email: 'staff.roads@example.com',
            phone: '9876512346',
            password: 'Staff@123',
            departmentId: 'clxdeptinfra',
          },
        },
        CreateComplaintExample: {
          summary: 'Seeded-style complaint payload',
          value: {
            title: 'Large pothole on Main Road',
            description: 'A deep pothole near the bus stop is causing traffic disruption and risk to two-wheelers.',
            categoryId: 'clxcatpothole',
            priority: 'High',
            address: 'Main Road, Ward 12',
            latitude: 13.0827,
            longitude: 80.2707,
          },
        },
        AssignComplaintExample: {
          summary: 'Assign to seeded infrastructure staff',
          value: {
            staffId: 'clxstaffinfra',
          },
        },
        UpdateStatusExample: {
          summary: 'Move complaint to in-progress',
          value: {
            status: 'InProgress',
            comment: 'Inspection completed and work order issued.',
          },
        },
        FeedbackExample: {
          summary: 'Close complaint with feedback',
          value: {
            rating: 5,
            comment: 'The road was repaired within two days.',
          },
        },
        InternalCommentExample: {
          summary: 'Add internal staff note',
          value: {
            comment: 'Need follow-up from utilities team before resurfacing.',
          },
        },
        EscalateComplaintExample: {
          summary: 'Escalate due to SLA risk',
          value: {
            reason: 'The site has become hazardous and requires immediate escalation.',
          },
        },
        ReopenComplaintExample: {
          summary: 'Reopen after incomplete resolution',
          value: {
            reason: 'The pothole reopened after the last rain.',
          },
        },
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI route (after swaggerSpec is defined)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check (no rate limit)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start SLA escalation job
slaEscalationJob;

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info({
    message: '✅ Server started successfully',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    api: `http://localhost:${PORT}/api`,
  });
});

module.exports = app; // For testing
