# Final Viva Notes

## Problem Statement
The system solves slow, fragmented complaint handling by providing a centralized platform with complaint intake, routing, tracking, escalation, and reporting.

## Key Design Decisions
- Prisma is used for a typed and maintainable data layer.
- RBAC is enforced at both route and service level to avoid privilege leaks.
- API responses use a consistent `success`, `data`, `message`, and `pagination` structure.
- Pagination is server-driven so large datasets do not overload the client.
- Swagger is used so frontend, backend, and reviewers can verify request and response contracts quickly.

## Production Readiness Improvements
- Centralized backend error handling.
- Rate limiting and security headers.
- Route-level frontend lazy loading.
- Notification UX and persistent table pagination controls.
- Vercel SPA route rewrites for direct page refresh support.

## Demo Flow
1. Login with seeded credentials from Swagger.
2. Create a complaint as a complainant.
3. Assign and update the complaint as manager/staff.
4. Show notification updates and analytics dashboard.
5. Show Swagger docs and Postman collection.

## Questions You Should Be Ready For
- Why use pagination instead of client-side filtering on full datasets?
- How do you prevent unauthorized complaint access by role?
- What would you improve next for scale?
- How does the CI pipeline protect production quality?
