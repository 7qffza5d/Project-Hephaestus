# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.1

### [Added]

- Everything?

## v0.2

### [Added]
- Auth.js v5 (next-auth@beta) with Credentials provider
- Prisma client singleton (lib/prisma.ts)
- JWT session strategy with role included in session
- Login page (/login)
- Change password API route and page (/settings/password)
- Settings landing page (/settings)
- SessionProvider wrapper (app/providers.tsx)
- Topbar with nav links, log out button, and color-coded initials avatar
- Database seed script (prisma/seed.ts, gitignored)

### [Changed]
- app/layout.tsx cleaned up to use Auth.js v5 patterns

### [Removed]
- Self-registration — accounts are pre-seeded by admin