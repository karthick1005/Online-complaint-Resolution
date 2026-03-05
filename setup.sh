#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Complaint Resolution System - Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Check Node.js
echo -e "\n${YELLOW}[1/5] Checking Node.js...${NC}"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
else
  echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi

# Check PostgreSQL
echo -e "\n${YELLOW}[2/5] Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
  PG_VERSION=$(psql --version)
  echo -e "${GREEN}✓ ${PG_VERSION}${NC}"
else
  echo -e "${RED}✗ PostgreSQL not found. Please install PostgreSQL 12+${NC}"
  exit 1
fi

# Backend setup
echo -e "\n${YELLOW}[3/5] Setting up Backend...${NC}"
cd backend

if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env file...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✓ .env created. Please edit with your database credentials${NC}"
else
  echo -e "${GREEN}✓ .env already exists${NC}"
fi

echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

echo -e "${YELLOW}Generating Prisma client...${NC}"
npm run prisma:generate --silent
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Frontend setup
echo -e "\n${YELLOW}[4/5] Setting up Frontend...${NC}"
cd ../frontend

echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Summary
echo -e "\n${YELLOW}[5/5] Setup Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Project setup complete!${NC}"
echo -e "${GREEN}========================================\n${NC}"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. ${YELLOW}Configure Database:${NC}"
echo -e "   - Edit backend/.env with PostgreSQL credentials"
echo -e "   - Run: cd backend && npm run prisma:migrate"
echo -e "   - Seed demo data: npm run prisma:seed"
echo ""
echo -e "2. ${YELLOW}Configure Email (Optional):${NC}"
echo -e "   - Update SMTP settings in backend/.env"
echo -e "   - Use Gmail app password for SMTP_PASSWORD"
echo ""
echo -e "3. ${YELLOW}Start Development Servers:${NC}"
echo -e "   - Backend: cd backend && npm run dev"
echo -e "   - Frontend: cd frontend && npm run dev"
echo ""
echo -e "4. ${YELLOW}Access Application:${NC}"
echo -e "   - Frontend: http://localhost:3000"
echo -e "   - Backend API: http://localhost:6969/api"
echo ""
echo -e "${YELLOW}Test Credentials:${NC}"
echo -e "   - Admin: admin@complaintresolution.com / Admin@123"
echo -e "   - Manager: manager@complaintresolution.com / Manager@123"
echo -e "   - Staff: staff@complaintresolution.com / Staff@123"
echo -e "   - User: user@example.com / User@123"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo -e "   - Main: README.md"
echo -e "   - API: API_DOCS.md"
echo -e "   - Deploy: DEPLOYMENT.md"
echo -e "   - Structure: PROJECT_STRUCTURE.md"
echo -e "\n${GREEN}Happy coding!${NC}\n"
