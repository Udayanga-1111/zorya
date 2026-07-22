<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:architecture-rules -->
# Backend Architecture Rules

1. **Authentication:**
   - Use `bcryptjs` for password hashing to maintain cross-platform compatibility (do not use `bcrypt`).
   - Use JWT (`jsonwebtoken`) for session management.
   - Use the `withAuth` Higher-Order Function (`lib/middleware/withAuth.ts`) to wrap protected route handlers.

2. **File Structure & Layers:**
   - **Routes (`app/api/**/route.ts`):** Keep extremely minimal. Only parse requests or delegate directly to controllers.
   - **Controllers (`lib/controllers/*.controller.ts`):** Handle request validation (using Zod) and orchestrate calls to services. Return `NextResponse` directly.
   - **Services (`lib/services/*.service.ts`):** Contain all core business logic (e.g., password hashing, JWT signing, DB query orchestration). Must remain independent of HTTP context.
   - **Models & Schema (`prisma/schema.prisma`):** Contain the database schema and models for Prisma ORM.
   - **Database Connection (`lib/db/prisma.ts`):** Export the `PrismaClient` singleton. Ensure `DATABASE_URL` is configured in the environment.
   - **Types (`lib/types/*.ts`):** Define TS interfaces separate from logic.

3. **Environment Variables:**
   - Always require `DATABASE_URL` for PostgreSQL connections.
   - Always require `JWT_SECRET` for token signing/verification.
<!-- END:architecture-rules -->
