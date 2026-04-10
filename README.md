# SiteSimple — Website Management Platform

White-label website management for small businesses. Build, manage, and deploy client websites from a single dashboard.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth.js v5
- @dnd-kit for drag-and-drop

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Setup

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd sitesimple
   npm install
   ```

2. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
   - `NEXT_PUBLIC_APP_URL` — `http://localhost:3000`

3. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Seed the database:
   ```bash
   npx prisma db seed
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 and log in:
   - **Admin**: anthonylsommers@gmail.com / Admin1234!
   - **Demo Client**: demo@client.com / Client1234!

## Project Structure
- `/src/app/admin/*` — Admin dashboard (manage clients, sites, pages)
- `/src/app/dashboard/*` — Client dashboard (edit site content)
- `/src/app/(public)/sites/[slug]` — Public site renderer
- `/src/components/sections/*` — Section type components
- `/prisma/schema.prisma` — Database schema

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy — Prisma migrations run via the build command

## Admin Credentials
- Email: anthonylsommers@gmail.com
- Password: Admin1234!
