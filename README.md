# EduSwap

A marketplace for verified college students to share notes, books and academic resources.

Monorepo with two independently deployable apps:

- **client/** — React + Vite + TypeScript (deploys to Vercel)
- **server/** — Express + TypeScript + MongoDB (deploys to Render)

## Quick start

```bash
# Backend
cd server
cp .env.example .env        # set MONGODB_URI + JWT secrets (SMTP optional in dev)
npm install
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd client
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5173
```

## Progress

| Phase | Scope                     | Status |
| ----- | ------------------------- | ------ |
| 1     | Architecture              | ✅ done |
| 2     | Backend setup             | ✅ done |
| 3     | Frontend setup            | ✅ done |
| 4     | Authentication            | ✅ done |
| 5     | College email + OTP       | ✅ done |
| 6     | Database models           | ✅ done |
| 7     | Resource upload           | ✅ done |
| 8     | Book marketplace          | ✅ done |
| 9     | Search + advanced filters | ✅ done |
| 10    | Bookmarks + wishlist      | ✅ done |
| 11    | Chat system (real-time)   | ✅ done |
| 12    | Admin panel + reports     | ✅ done |
| 13    | Testing                   | ✅ done |
| 14    | Deployment                | ✅ done |
| 15    | Final optimization        | ✅ done |

## College email verification (Phase 5)

- Signup issues a 6-digit OTP (hashed at rest, 10-minute expiry) and emails it
- Personal/free email domains (gmail, yahoo, ...) are rejected at signup
- `POST /auth/verify-otp` verifies the code and auto-logs the student in
- `POST /auth/resend-otp` issues a fresh code
- Login is blocked for unverified accounts (`403 EMAIL_NOT_VERIFIED`); the client
  redirects those users to the verification screen
- Password-reset now emails a real link via the same mailer

### Email in development

If no `SMTP_*` env is set, the mailer logs the message (code / reset link) to the
server console instead of sending — so the full flow works locally with zero setup.
Signup and resend also return the code as `devOtp` in non-production for testing.
Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` to send real email.

## Database models (Phase 6)

Nine Mongoose collections with typed interfaces, indexes and references:

- **User** — auth, role, verification (Phase 4/5)
- **Resource** — notes/PDFs/assignments; text index for search; counters
- **Book** — marketplace listings with condition + status (available/reserved/sold)
- **Chat / Message** — 1:1 conversations and their messages
- **Bookmark** — bookmarks and wishlist over a dynamic (Resource|Book) target
- **Review** — 1–5 ratings on a resource or seller
- **Report** — spam/abuse flags with an admin status workflow
- **Notification** — per-user notifications

Shared academic vocabulary (departments, semesters, resource types, book
conditions, etc.) lives in `server/src/utils/enums.ts` as the single source of
truth. Repositories and services for these arrive with each feature phase.

## Resource upload (Phase 7)

- Cloudinary storage: PDF documents + up to 5 preview images (Multer memory → stream)
- `POST /resources` (verified only), `GET /resources` with filters + pagination + sort,
  `GET /resources/:id` (view counter), `GET /resources/:id/download` (download counter),
  `GET /resources/mine`, `DELETE /resources/:id` (owner or admin, cleans up Cloudinary)
- Client: upload form with drag-drop dropzones + progress bar, browse grid with
  department/semester/type/sort filters, skeletons + empty state, and a detail page
  with image gallery and download.

Cloudinary env (`CLOUDINARY_*`) is required for real uploads; without it the API
returns a clear "storage not configured" error.

## Book marketplace (Phase 8)

- `POST /books` (verified, photos), `GET /books` with condition/status/price filters +
  sort, `GET /books/:id`, `GET /books/mine`, `DELETE /books/:id`
- Status flow: `POST /books/:id/reserve` (any buyer, not the seller),
  `/cancel-reservation` (seller or reserver), `/mark-sold` (seller)
- Client: sell-a-book form, marketplace grid with condition/status/price-sort filters,
  and a detail page with contextual actions (reserve / cancel / mark-sold / delete)
  based on whether you're the seller, the reserver, or a buyer.

## Search (Phase 9)

- `GET /resources?q=` and `GET /books?q=` search across title, description, subject,
  tags, course code — and uploader/seller name (resolved via a name lookup, then
  OR-matched by id), combinable with all existing filters.
- User input is regex-escaped, so a query like `.*` is matched literally, never
  interpreted as a wildcard.
- Client: debounced (400 ms) search bars on both browse pages that reset paging.

## Bookmarks + wishlist (Phase 10)

- One `Bookmark` collection covers both bookmarks and wishlist over a dynamic
  Resource|Book target (refPath), with a unique index preventing duplicates.
- `POST /bookmarks/toggle` (add/remove), `GET /bookmarks/check`, `GET /bookmarks`
  (populated list by kind). Resource `bookmarksCount` is kept in sync on toggle.
- Client: a reusable SaveButton (bookmark + wishlist) on both detail pages, and a
  Saved page with Bookmarks/Wishlist tabs reusing the resource and book cards.

## Chat system (Phase 11)

- Socket.IO authenticated via the JWT handshake; each user joins a personal room
  and per-conversation rooms.
- Messages are sent over REST (`POST /chats/:id/messages`, persisted + validated),
  then the server emits `message:new` to the room for live delivery — one code path
  for persistence, no duplicate-message races.
- `POST /chats` finds-or-creates a conversation (optionally scoped to a resource or
  book), `GET /chats` lists conversations, `GET /chats/:id/messages` returns history
  and marks read. Typing relay over `typing`.
- Client: socket connects on login/refresh and disconnects on logout; a two-pane
  chat page (list + live thread) with auto-scroll, and "Message" buttons on resource
  and book detail pages that start a scoped conversation (book chats double as
  negotiation).

## Admin panel + reports (Phase 12)

- Any verified student can file a report: `POST /reports` (dedup-guarded so you
  can't spam the same target). Report a resource/book from its detail page.
- Admin-only (via `authorize('admin')`): `GET /reports` + `PATCH /reports/:id`
  (resolve/dismiss), `GET /admin/stats`, `GET /admin/users` + delete,
  `GET /admin/resources` + delete, `GET /admin/books` + delete.
- Client admin panel (behind the RoleRoute): dashboard stats, searchable user and
  resource tables with delete, and a reports queue with resolve/dismiss actions.

### Creating an admin

Signup always creates a `student`. To make an admin, set the user's `role` to
`"admin"` directly in MongoDB Atlas (or add a small seed script). A proper seed
script can be added in Phase 13.

## Testing (Phase 13)

Backend (Vitest + Supertest):

```bash
cd server && npm test
```

- Unit tests: JWT round-trip, crypto (sha256/OTP/token), regex escaping, email-domain
  rules, and Zod validators (incl. multipart coercion).
- Route-guard integration tests via Supertest against `app.ts` (no DB): health, 404,
  auth/verified/admin guards, signup domain rejection.
- Full auth-flow integration (signup → verify OTP → login → me, duplicate + wrong-password
  cases) against an in-memory MongoDB. These self-skip if the Mongo binary can't be
  downloaded (e.g. a locked-down CI) and run fully on a normal machine.

Frontend (Vitest): `cd client && npm test` — unit tests for the price/relative-time
formatters and the `cn` class merger.

### Seed demo data (optional)

```bash
cd server && npm run seed:demo
```
Creates verified demo users (admin@demo.edu / DemoPass1, asha@demo.edu / DemoPass1),
plus sample resources and books. Safe to re-run — it only touches demo.edu data.

### Seed an admin

```bash
cd server && npm run seed:admin -- you@yourcollege.edu
```

## Deployment (Phase 14)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full guide. In short:

- **Backend → Render** via the included `render.yaml` blueprint (build/start/health
  preconfigured), or a manual Web Service with root `server/`.
- **Frontend → Vercel** with root `client/`; `client/vercel.json` adds the SPA rewrite.
- Production CORS + Socket.IO read a comma-separated `CORS_ORIGINS` allowlist; refresh
  cookies are `SameSite=None; Secure` in production behind a trusted proxy.
- **CI:** `.github/workflows/ci.yml` runs typecheck + build + test for both apps on every
  push and pull request.

## Final optimization (Phase 15)

- Route-level code splitting: every page is a lazy chunk (2–6 kB) loaded on demand,
  with a Suspense spinner per layout. The old 500 kB single-bundle warning is gone.
- Vendor code split into `react`, `router`, `query`, `ui`, `socket`, `vendor` chunks.
- Server gzip compression (`compression`) on all responses.

**Status: all 15 phases complete.** See DEPLOYMENT.md to ship it.
