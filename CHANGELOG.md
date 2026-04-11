# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.3

### [Added]
- Homework tracker - class-wide items grouped into Overdue, Due Soon, and Upcoming
- Per-user done state via HomeworkCompletion join table
- Overdue highlighting with red left border on homework cards
- Admin-only add, edit, and delete for homework items
- resourceUrl optional field on HomeworkItem for linking to files
- Schedule page with custom calendar grid (no external library)
- Calendar sidebar - clicking a day shows that day's events
- Agenda view - upcoming events grouped by month
- Toggle button to switch between Calendar and Agenda views
- Admin-only add, edit, and delete for events
- proxy.ts middleware - protects all routes, appends callbackUrl on redirect
- callbackUrl passthrough in login form - redirects to intended page after login

### [Changed]

- HomeworkItem schema - removed done Boolean, added resourceUrl String? and completions
relation
- User schema - added completions HomeworkCompletion[] relation
- Login page - added useSearchParams and callbackUrl support, wrapped in Suspense
- AddEventModal - split datetime-local into separate date and time inputs for Firefox compatibility
Fixed
- Named import required for prisma client ({prisma} not default)

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

## v0.1

### [Added]

- Everything?