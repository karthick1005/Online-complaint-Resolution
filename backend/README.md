# 🚀 Complaint Resolution Backend

Enterprise-grade Node.js API power by Express and Prisma, designed for high-concurrency complaint management.

## 🛠️ Architecture & Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma with PostgreSQL
- **Real-time**: Socket.io for live updates
- **Task Scheduling**: `node-cron` for SLA escalations
- **Logging**: Pino with structured JSON output
- **Security**: 
  - JWT Authentication
  - RBAC (Role-Based Access Control)
  - Helmet for security headers
  - Express Rate Limit for DoS protection

## 📦 Project Structure
- `src/controllers/`: Request handling and validation
- `src/services/`: Core business logic
- `src/repositories/`: Data access layer (Separation of Concerns)
- `src/middleware/`: Security, Auth, and Error handling
- `src/jobs/`: Automated background tasks (SLA logic)
- `prisma/`: Database schema and migration history

## 🚦 Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL instance running

### Local Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/complaint_db"
   JWT_SECRET="your_secret_key"
   PORT=5000
   FRONTEND_URL="http://localhost:3000"
   ```
3. **Database Initialization**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run prisma:seed
   ```
4. **Run Server**:
   ```bash
   npm run dev
   ```

## 🧪 Testing
- Run unit and integration tests: `npm test`

## 🚀 Production Notes
- Use `npm start` for production.
- Recommended to use a process manager like **PM2**.
- Ensure `NODE_ENV` is set to `production`.
- Monitor logs via Pino-compatible transports.
