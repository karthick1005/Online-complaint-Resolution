# Online Complaint Resolution System

A full-stack application for managing citizen complaints with role-based access control, file uploads, email notifications, and SLA management.

## 🏗️ Architecture

```
onlinecomplaint/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── index.js        # Entry point
│   │   ├── middleware/     # Auth, RBAC, validation
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers & utilities
│   │   └── jobs/           # Cron jobs (SLA)
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Demo data
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
│
└── frontend/                # React + Vite
    ├── src/
    │   ├── main.jsx        # Entry point
    │   ├── App.jsx         # Router setup
    │   ├── api.js          # Axios instance
    │   ├── context/        # Auth context
    │   ├── components/     # Reusable components
    │   ├── pages/          # Page components
    │   └── index.css       # Styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database URL and email credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/complaint_db"

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data
npm run prisma:seed

# Start development server
npm run dev
```

Backend runs on `http://localhost:6969`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🔐 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | View all complaints, analytics, user management |
| **Department Manager** | View department complaints, assign staff, update status |
| **Staff** | View assigned complaints, update status |
| **Complainant** | File complaints, track status, provide feedback |
| **Guest** | Read-only access (future implementation) |

## 📝 Test Credentials

```
Admin:     admin@complaintresolution.com / Admin@123
Manager:   manager@complaintresolution.com / Manager@123
Staff:     staff@complaintresolution.com / Staff@123
User:      user@example.com / User@123
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - List complaints (filtered by role)
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id/status` - Update status
- `POST /api/complaints/:id/assign` - Assign to staff
- `POST /api/complaints/:id/feedback` - Add feedback

### Analytics
- `GET /api/analytics/dashboard/stats` - Dashboard statistics (manager/admin only)

## 🗄️ Database Schema

### Users
- Stores user accounts with roles and departments
- Password hashing with bcrypt
- JWT token support

### Complaints
- Core complaint data
- Auto-generated complaint codes
- SLA deadline tracking
- Priority and status management

### Complaint History
- Audit trail of all status changes
- Comments and updates from staff
- Tracks who made changes and when

### Attachments
- File uploads for complaints (max 10MB)
- Support for PDF, JPEG, PNG
- Stored with complaint reference

### Feedback
- Post-resolution satisfaction ratings
- Comments for improvement

### Departments & Categories
- Organize complaints by department
- Categorize issues for better routing

## ⚙️ Key Features

### Authentication & Security
- ✅ JWT-based authentication
- ✅ bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Input validation with express-validator
- ✅ SQL injection protection via Prisma ORM

### Complaint Management
- ✅ Auto-generate unique complaint codes
- ✅ Auto-assign department based on category
- ✅ SLA deadline calculation by priority
- ✅ Status workflow management
- ✅ Full audit trail

### File Handling
- ✅ Multer file uploads (max 10MB)
- ✅ File type validation (PDF, JPEG, PNG)
- ✅ Multiple file support per complaint

### Email Notifications
- ✅ Complaint registration confirmation
- ✅ Status change notifications
- ✅ Assignment notifications
- ✅ SLA breach escalation emails
- ✅ Uses Nodemailer with SMTP

### SLA Management
- ✅ Automatic SLA deadline calculation
- ✅ Hourly cron job to check breaches
- ✅ Auto-escalation on deadline miss
- ✅ Email alerts for escalations

### Dashboard & Analytics
- ✅ Admin dashboard with statistics
- ✅ Complaint counts by status/priority
- ✅ Department-wise breakdown
- ✅ Average ratings and resolution rate
- ✅ SLA breach tracking

### User Interfaces
- ✅ Responsive design
- ✅ Role-based navigation
- ✅ Search and filter complaints
- ✅ Pagination support
- ✅ Status timeline visualization

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/complaint_db
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@complaintresolution.com
PORT=5000
NODE_ENV=development
```

**Frontend** (Vite proxy configured in vite.config.js)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:6969',
    changeOrigin: true
  }
}
```

## 🗄️ Database Setup

### PostgreSQL Installation

**macOS:**
```bash
brew install postgresql
brew services start postgresql
createdb complaint_db
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb complaint_db
```

### Prisma Migrations

```bash
# Create new migration
npm run prisma:migrate

# View database
npx prisma studio
```

## 📦 Dependencies

### Backend
- **Express** - Web framework
- **Prisma** - ORM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT auth
- **multer** - File uploads
- **nodemailer** - Email sending
- **node-cron** - Scheduled jobs
- **express-validator** - Input validation
- **cors** - Cross-origin requests

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client routing
- **Axios** - HTTP client
- **date-fns** - Date utilities

## 🧪 Testing

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:6969/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123","confirmPassword":"Test@123"}'

# Login
curl -X POST http://localhost:6969/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"User@123"}'

# Get complaints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:6969/api/complaints
```

## 📋 Complaint Workflow

1. **Registered** - User files complaint
2. **Assigned** - Manager assigns to staff
3. **In Progress** - Staff works on resolution
4. **Resolved** - Staff marks as resolved
5. **Closed** - User provides feedback
6. **Escalated** - Auto-escalated on SLA breach

## 🚨 SLA Escalation

- **Critical:** 4 hours
- **High:** 24 hours
- **Medium:** 48 hours
- **Low:** 72 hours

Automatic escalation runs every hour via cron job.

## 📧 Email Templates

System sends automated emails for:
- Complaint registration
- Status updates
- Assignment notifications
- SLA breach escalations
- Closure reminders

## 🎨 Styling

Uses vanilla CSS with CSS variables for theming:
```css
--primary: #007bff
--secondary: #6c757d
--success: #28a745
--danger: #dc3545
```

## 🔄 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* actual data */ },
  "token": "jwt-token" /* if auth */
}
```

### Error Response
```json
{
  "error": "Error message",
  "errors": [ /* validation errors */ ]
}
```

## 🚀 Deployment

### Backend (Production)
```bash
npm run build
npm start
# Set NODE_ENV=production
```

### Frontend (Production)
```bash
npm run build
# Serve dist/ folder with nginx/apache
```

## 📞 Support

For issues or questions:
1. Check database is running
2. Verify .env configuration
3. Check Prisma migrations: `npx prisma migrate status`
4. Review logs in terminal/console
5. Ensure ports 3000 and 5000 are not in use

## 📄 License

MIT

## 👨‍💻 Development

### Adding New Features

1. Update Prisma schema if needed
2. Create migration: `npm run prisma:migrate`
3. Update service layer
4. Create/update controller
5. Add route
6. Create React component

### Code Standards

- Use functional components in React
- Use hooks for state management
- Implement proper error handling
- Follow REST naming conventions
- Always validate input
- Hash passwords with bcrypt
- Use JWT for auth tokens

---

**Created:** February 2026
**Status:** Production Ready
