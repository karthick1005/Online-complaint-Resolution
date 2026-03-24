# Online Complaint Resolution System Report

## Overview
This project is a full-stack complaint management platform for citizens, staff, department managers, and administrators. It supports complaint registration, assignment, SLA tracking, status updates, notifications, analytics, and feedback collection.

## Core Architecture
- Frontend: React + Vite + Tailwind + TanStack Query
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL
- Realtime: Socket.io
- Documentation: Swagger

## Implemented Requirements

### UI/UX Refinement
- Responsive layouts for dashboard, complaint tables, admin management pages, and detail pages.
- Search, filters, table pagination, rows-per-page controls, loaders, and toast feedback.
- Motion and transition support via Framer Motion.
- Vercel SPA refresh handling via [vercel.json](/Users/udhayakarthick/Desktop/Developer/pbl/onlinecomplaint/frontend/vercel.json).

### Advanced Logic
- Role-based access control for `admin`, `department_manager`, `staff`, and `complainant`.
- Server-side pagination across major listing APIs.
- Search and filtering across complaint/user/admin table views.
- SLA escalation background job.
- Notification dropdown with mark-one and mark-all read support.
- Reverse geolocation support and explicit browser GPS capture.
- Realtime websocket events for complaint lifecycle updates.

### Performance and Reliability
- Backend list endpoints now use pagination metadata and bounded query sizes.
- Route-level frontend code splitting is implemented with `React.lazy` and `Suspense` in [App.jsx](/Users/udhayakarthick/Desktop/Developer/pbl/onlinecomplaint/frontend/src/App.jsx).
- Basic backend unit tests cover response and pagination helpers.
- Centralized API error handling standardizes production responses.

### Production Deployment
- Frontend is structured for Vercel deployment.
- Backend is structured for Render deployment.
- GitHub Actions CI/CD pipeline is defined in [.github/workflows/ci.yml](/Users/udhayakarthick/Desktop/Developer/pbl/onlinecomplaint/.github/workflows/ci.yml).
- Optional deploy steps are included for Vercel and Render using repository secrets.

### Documentation
- Swagger documents the backend API and includes seeded examples.
- A Postman collection is included under `docs/postman`.
- This report and viva notes are included for final submission support.

## Known Gaps
- CI deploy steps require repository secrets before they can perform live deployment.
- Automated tests are currently basic and should be extended to cover API/service integration flows.
- Frontend bundle warnings still indicate room for deeper chunk optimization beyond initial route splitting.

## Recommended Viva Talking Points
- Why standardized response envelopes improve frontend/backend maintainability.
- How RBAC boundaries are enforced across routes and services.
- Why server-side pagination is required for production-scale tables.
- How CI/CD and environment-based deployment secrets are separated from application code.
