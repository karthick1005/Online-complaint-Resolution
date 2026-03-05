# 🚀 Database Setup Guide

## Prerequisites
Make sure PostgreSQL is running on your machine.

### For macOS (using Homebrew):
```bash
# Install PostgreSQL if not installed
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database user and database
psql postgres -c "CREATE USER postgres WITH PASSWORD 'password';"
psql postgres -c "CREATE DATABASE complaint_db OWNER postgres;"
```

### For Windows/Linux:
Ensure PostgreSQL is installed and running with a database called `complaint_db`.

---

## Setup Steps

### 1. Backend Setup

```bash
cd backend

# Copy .env file (already created)
# Verify DATABASE_URL in .env points to your PostgreSQL instance
cat .env

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations (creates tables)
npm run prisma:migrate

# Seed database with test data
npm run prisma:seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:6969`

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies (already done with npm i)
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@complaintresolution.com | Admin@123 |
| Manager | manager@complaintresolution.com | Manager@123 |
| Staff | staff@complaintresolution.com | Staff@123 |
| User | user@example.com | User@123 |

---

## API Endpoints

- **Health Check**: `GET /api/health`
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Complaints**: `GET /api/complaints`, `POST /api/complaints`, `GET /api/complaints/:id`, `PUT /api/complaints/:id/status`
- **Analytics**: `GET /api/analytics/dashboard/stats`

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run dev
```

### Database Connection Error
- Ensure PostgreSQL is running: `brew services list`
- Check DATABASE_URL in `.env` file
- Verify database exists: `psql -U postgres -l | grep complaint_db`

### Prisma Issues
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate client
npm run prisma:generate
```

---

## Next Steps

1. ✅ Ensure PostgreSQL is running
2. ⏭️ Run backend setup commands above
3. ⏭️ Run frontend with `npm run dev`
4. ⏭️ Login with test credentials
5. ⏭️ Create complaints, manage them by role
