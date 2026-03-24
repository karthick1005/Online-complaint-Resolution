# 🎫 Online Complaint Resolution System

A production-ready, full-stack enterprise application designed to streamline the lifecycle of citizen complaints. This system features robust role-based access control (RBAC), Service Level Agreement (SLA) tracking, real-time notifications via WebSockets, and a modern, responsive user interface.

## 🌟 Key Features

- **Multi-Role RBAC**: Granular permissions for Admins, Department Managers, Staff, and Complainants.
- **Complaint Lifecycle**: Comprehensive tracking from submission and assignment to resolution and feedback.
- **SLA Management**: Automated background jobs for escalating overdue complaints.
- **Real-Time Updates**: Instant status notifications powered by Socket.io.
- **Smart Analytics**: Executive dashboard with data visualization for department performance.
- **Security First**: Implementation of advanced rate limiting, secure HTTP headers (Helmet), and input validation.
- **Mobile Optimized**: Fully responsive design with specific optimizations for mobile browsers.

## 🛠️ Tech Stack

### Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL (Prisma ORM)
- **Real-time**: Socket.io
- **SLA Jobs**: node-cron
- **Logging**: Pino & Pino-pretty
- **Mailing**: Nodemailer
- **Security**: JWT Authentication, express-rate-limit, Helmet

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI, Lucide Icons
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **PostgreSQL**: v12 or higher
- **Package Manager**: npm or yarn

### 1. Repository Setup
```bash
git clone <repository-url>
cd onlinecomplaint
```

### 2. Backend Configuration
```bash
cd backend

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Configure DATABASE_URL, JWT_SECRET, and SMTP settings in .env

# Database initialization
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 3. Frontend Configuration
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Production Deployment

### Backend
1. **Environment Variables**: Ensure all variables in `.env` are set to production values.
   - `NODE_ENV=production`
   - `FRONTEND_URL`: Set to your production domain.
2. **Build**: Prisma client must be generated (`npm run prisma:generate`).
3. **Execution**: Use a process manager like **PM2** to run the server.
   ```bash
   pm2 start src/index.js --name "complaint-api"
   ```

### Frontend
1. **Build**: Generate theoptimized production bundle.
   ```bash
   npm run build
   ```
2. **Hosting**: Deploy the contents of the `dist/` folder to a static host (Netlify, Vercel, Nginx, etc.).

## 📁 Project Structure

```text
onlinecomplaint/
├── backend/                 # Express API & Prisma
│   ├── src/                 # Source code
│   │   ├── controllers/     # Request logic
│   │   ├── middleware/      # Auth, RBAC, Security
│   │   ├── repositories/    # Data access layer
│   │   ├── services/        # Business logic
│   │   └── websocket/       # Socket handlers
│   └── prisma/              # Database schema & migrations
└── frontend/                # React + Vite
    ├── src/                 # Application source
    │   ├── components/      # UI & Layout components
    │   ├── features/        # Feature-based logic
    │   ├── hooks/           # Custom React hooks
    │   └── pages/           # Route components
```

## 🔐 Security & Optimization

- **Rate Limiting**: Configured to prevent brute force and DoS attacks.
- **Encryption**: Passwords hashed using bcrypt.
- **SLA Escalation**: Automatic monitoring of resolution times.
- **Caching**: Foundation for Redis integration included in the backend.

## 📄 License
This project is licensed under the ISC License.
