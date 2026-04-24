# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.5

### [Added]

- Writing feed at /writing — Blogs and Notes in separate tabs
- New post page at /writing/new — full split-pane editor
- Post view at /writing/[id] — rendered markdown with edit/delete controls
- Edit page at /writing/[id]/edit — pre-populated PostEditor
- Public share page at /share/[token] — no auth required
- GET / POST /api/posts — feed and create endpoints
- GET / PATCH / DELETE /api/posts/[id] — single post endpoints
- GET /api/posts/share/[token] — public no-auth endpoint
- MarkdownPreview component — react-markdown with KaTeX + highlight pipeline
- PostEditor component — toolbar (title, type toggle, visibility, pseudonym, publish) + split pane
- AuthorDisplay component — encapsulates pseudonym/real name display logic for all contexts
- Visibility system: PRIVATE / CLASS / SHARED with shareToken generation
- shareToken nulled when visibility changed away from SHARED — old links die immediately
- Per-post pseudonym field — students can post under any name
- Admin see-through — admins always see real name alongside pseudonym
- Markdown preview styles added to globals.css as plain CSS (Tailwind v4 — no @apply)
- pseudonym String? added to Post model

### [Fixed]
- PrismaAdapter removed from auth.ts — adapter was silently preventing user.id from populating in JWT jwt()
callback when used alongside a Credentials provider with JWT session strategy. Symptom: session.user.id was
undefined, causing P2003 foreign key constraint violation on prisma.post.create().
- window.location.origin moved from component render into onClick handler in PostPage.tsx — window is not
available during SSR, causing a server component crash (digest error) immediately after a post was created and
the router redirected to /writing/[id].
- Internal fetch(NEXTAUTH_URL + /api/posts/[id]) in server components replaced with direct
prisma.post.findUnique() calls — internal fetch is unreliable in Next.js 16 server components and caused runtime
crashes on the post view and edit pages.
- body variable name collision in POST /api/posts — the destructured field body (post content) shadowed the body
variable holding the parsed request JSON. Renamed to postBody.
- createdAt typed as string in PostPage Post interface — Prisma returns a Date object when queried directly from a
server component. Widened to Date | string.

## v0.4

### [Added]

- File library at /vault — folder sidebar, file grid, upload, and delete
- Folder model with freeform admin-created names and cascade delete
- FileItem model storing Vercel Blob URL, size, and MIME type
- POST /api/files — uploads PDF to Vercel Blob then writes DB record
- DELETE /api/files/[id] — deletes from Blob first, then DB
- POST /api/folders and DELETE /api/folders/[id]
- Server-side PDF-only MIME type validation (HTTP 415 on rejection)
- Orphan protection — blob deleted if DB write fails after upload
- BLOB_READ_WRITE_TOKEN environment variable via Vercel Blob store
  
### [Changed]

- HomeworkItem.resourceUrl String? replaced by fileItemId String? FK to FileItem
- AddHomeworkModal resource URL text input replaced by cascading folder/file picker
- HomeworkItem component updated to render PDF link from fileItem relation
- GET /api/homework now includes fileItem { id, url, name } in response

### [Fixed]

- Next.js 16: params in dynamic route handlers must be awaited (Promise<{id}>)
- prisma.config.ts import changed from prisma/config to @prisma/config
- DATABASE_URL migrated from localhost PostgreSQL to Neon cloud (pooled URL)
- Vercel Blob store recreated as public — private store does not support public access mode

### [Removed]

- That one console log in HomeworkPage

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