# Connect — Build Process Log

## Current Status
- Audit status: <not release-ready; backend integration tests and major product/security contracts remain incomplete>
- Last ticket that can be treated as complete from this audit: <none; the claimed completion state is being corrected below>
- Next priority: <restore build health, then implement booking/availability before earnings withdrawals>
- Overall progress: <foundations and verification slices exist, but Epic 3 onward is incomplete>

## What's Working
- Repository scaffolding exists for the FastAPI backend, React/Vite admin, and two Expo apps.
- Admin production build passes.
- Both mobile TypeScript checks and Android Expo exports pass after audit repairs.
- JWT auth, guide verification routes, audit-log model, and guide dashboard source exist, but the release claims below remain subject to the audit findings.

## What's In Progress / Partially Done
- Full repository audit in progress; the findings below are not optional release work.
- Guide earnings withdrawal is not a v1-compliant deliverable: the PRD excludes payouts, and the current endpoint has no atomic balance reservation or admin processing path.

## Decisions & Deviations
- Used JWT for stateless authentication (as per TAD).
- Used bcrypt for password hashing (via passlib).
- Access token expiration: 15 minutes, refresh token expiration: 30 days (as per config).
- Role is derived from the token and verified against the database (defense in depth).
- For guides, signup creates a GuideProfile with `verification_status = pending`.
- Admin login only; accounts are created by bootstrap or existing admins.
- Stack changed from Capacitor to Expo for connect_user/connect_guide; this remains a deliberate deviation recorded before the audit.
- Audit repairs: fixed backend syntax/import/SQLAlchemy mapper blockers, constrained guide booking status updates to `pending -> accepted|declined`, corrected refresh-token bcrypt verification, and aligned Admin/native login requests with the FastAPI auth contracts.

## Known Issues / TODOs
- Backend environment is now declared in `backend/requirements.txt` from the verified Python 3.12 virtual environment; the remaining warnings are Pydantic/SQLAlchemy/passlib/httpx deprecations.
- Booking creation is absent: there is no tourist booking endpoint, Availability locking/slot decrement, idempotency, or completed/cancelled transition endpoint. The current guide status route only handles accept/decline.
- The initial migration does not create `refresh_tokens`, `withdrawals`, or the document/balance columns now present in `GuideProfile`; Review and Report models/routes are absent. Treat tickets 0.2, 1.4, 2.7, and Epics 4-8 as incomplete.
- Verification document responses expose private storage paths instead of authorized short-lived signed URLs; upload type/size validation and admin document access checks are missing.
- Auth and write endpoints lack the required rate limiting, consistent `{error:{code,message}}` envelope, and input sanitization/validation coverage.
- Connect Admin only implements login and verification queue. Dashboard, users, guides, bookings, tours, reviews, reports, settings, admin-account management, and dispute audit flows are absent; its lint command fails because ESLint 9 has no `eslint.config.*`.
- Both Expo apps now pass TypeScript checks and Android exports, but still contain hard-coded localhost URLs, missing shared typed Axios clients, and user/guide list screens using ScrollView/map patterns for data that should be virtualized.
- Expo web exports remain blocked because `react-native-web` is not installed; web is not a required production target for these native-only apps.
- Mobile apps do not use `expo-image`, do not consistently use safe-area insets for fixed navigation/header elements, and lack EAS build profiles, push notifications, camera/location modules, and WebSocket chat.
- Mobile dependency manifests omit Axios and disagree on safe-area/screens versions. Expo Doctor still reports Expo SDK patch drift and invalid `app.json` branding config: `assets/icon.png` is a 549x110 wordmark but is configured as a square app icon, and the current `splash` field fails the SDK schema.
- Neither mobile app has an `.env` or `.env.example`; their API URLs remain hard-coded and must be moved behind an environment strategy before staging/production.
- `Connect_Feature_Ticket_List.md` remains an unchecked backlog while `PROCESS.md` previously marked the same work Done; ticket statuses must be reconciled before claiming completion.

## Environment / Setup Notes
- Python 3.12.3 environment created at `backend/venv`; install with `venv/bin/pip install -r requirements.txt`.
- `docker compose up -d` starts PostgreSQL 15 on host port `5434` (container port `5432`). An older stopped `connect_postgres` container had to be recreated because host `5432` was occupied.
- Run `venv/bin/alembic upgrade head` to apply migrations; both current revisions apply successfully on a fresh local database.
- Backend boots on `http://localhost:8000`; `venv/bin/pytest -q` passes 11 tests with deprecation warnings.
- Admin uses npm lockfile installation; `npm ci`, `npm run build`, and Vite startup pass. npm reports 4 audit vulnerabilities and ESLint 9 has no config file.
- Mobile apps use npm lockfiles. `npm ci` requires `--legacy-peer-deps` because Expo's optional `react-dom@19.3.0` peer conflicts with React Native's pinned `react@19.2.3`; TypeScript checks, Android exports, and Metro startup pass for both apps. npm reports 14 moderate audit vulnerabilities per mobile app.
- Frontend apps expect API at `http://localhost:8000/api/v1` (as per .env.example)

## Ticket Log
| Ticket | Status | Notes |
|---|---|---|
| 0.0 | Done | Installed and enabled Ponytail (DietrichGebert/ponytail) |
| 0.1 | Done | Repo scaffolding: backend (FastAPI), web/connect_admin, mobile/connect_user, mobile/connect_guide |
| 0.2 | Audit failed | Migration/model drift: refresh tokens, withdrawals, document/balance fields, Review, and Report are not represented consistently |
| 0.3 | Audit failed | Backend/Admin env files exist, but neither mobile app has `.env` or `.env.example`; Compose now runs Postgres on documented port 5434 |
| 0.4 | Done | create_admin.py bootstrap script for the first admin account |
| 0.5 | Done | Place logo_connect.png in a shared branding location and generate derivatives |
| 0.6 | Audit failed | Mobile TypeScript/native Android exports pass, but the component system still drifts from the documented NativeWind/safe-area architecture |
| 1.1 | Done | Tourist signup/login (email+password), JWT issuance |
| 1.2 | Done | Guide signup/login, JWT issuance, initial `verification_status = pending` |
| 1.3 | Done | Admin login (no public signup path) |
| 1.4 | Audit failed | Refresh-token lookup was broken by re-hashing with a random bcrypt salt; repaired in code but not integration-tested because backend dependencies are unavailable |
| 1.5 | Audit failed | Some protected writes are incomplete or missing ownership/state checks; full §8 checklist is outstanding |
| 2.1 | Audit failed | Mobile onboarding includes simulated/duplicate flows and private document paths are returned rather than signed URLs |
| 2.2 | Audit failed | Queue exists, but admin UI links raw private paths and the broader admin app is absent |
| 2.3 | Done | Admin approve/reject action with reason, writes to audit log (Created VerificationAuditLog model with migration, integrated into approve/reject endpoints to log all admin verification actions) |
| 2.4 | Audit failed | Status screen exists, but it exposes document paths and the full secure document-access flow is absent |
| 2.5 | Audit failed | Dashboard code and native bundle exist, but booking creation/state machine is absent |
| 2.6 | Audit failed | Verification checks cover several guide dashboard reads/writes, but the full listing/public-search contract is not implemented and booking writes are absent |
| 2.7 | Blocked | Withdrawal code exists, but it conflicts with the v1 estimate-only scope and lacks migration, atomic reservation, and admin processing |


---

## 2026-11-25: Antigravity Frontend Rebuild & Remote Synchronization

### Completed Work
1. **Remote Repository Synchronization:**
   - Updated remote origin URL to the new target repository: `https://github.com/Kushalitgithub/Connect.git`.
   - Verified `.gitignore` to prevent any `.env`, secret files, or sqlite database files from leaking.
   - Preserved all local uncommitted/untracked work and successfully pushed the full baseline to `main` on the new GitHub repository.

2. **Branch & Architecture Setup:**
   - Created working branch `frontend-rebuild` with tag `local-before-rebuild` on local HEAD.
   - Established the top-level `shared/` package containing design tokens (`Colors`, `Spacing`, `Radii`) and Zod validation schemas (`UserRole`, `LoginRequest`, `TouristSignup`, `GuideSignup`, `GuideProfile`, `TourCreate`, `BookingRequest`).
   - Resolved mobile TypeScript `nativewind/types` dependency errors; aligned peer dependencies cleanly.

3. **Connect User (Tourist App - React Native / Expo):**
   - Implemented custom floating translucent bottom navigation bar (`BottomNav.tsx`) with active orange state, safe area insets, and icon integration via `lucide-react-native` (`Home`, `Find Guide`, `Bookings`, `Inbox`).
   - Implemented `TouristHomeScreen` (`(tabs)/home.tsx`) matching `Tourist_HomePage.png` with search triggers, popular destination cards, and verified local guide highlights.
   - Implemented `ExploreGuideScreen` (`(tabs)/guide.tsx`) matching `Tourist_ExploreGuide.png` and `Tourist_ExploreGuide_FiltersOption.png` with live filter sheet modal (Language, Specialty).
   - Implemented `TouristBookingsScreen` (`(tabs)/bookings.tsx`) matching `Tourist_Booking_Upcoming.png` and `Tourist_Booking_Past.png` with tab switching, status badges, and cancel confirmation dialog.
   - Implemented `TouristInboxScreen` (`(tabs)/inbox.tsx`) matching conversation thread list.

4. **Connect Guide (Guide App - React Native / Expo):**
   - Implemented floating translucent bottom bar (`BottomNav.tsx`) with active indicator (`Dashboard`, `Requests`, `Bookings`, `Inbox`).
   - Implemented `GuideDashboardScreen` (`(tabs)/dashboard.tsx`) matching `LocalGuide_Page.png` with real-time metrics cards, new tour quick action, and catalog management hub.
   - Implemented `GuideRequestsScreen` (`(tabs)/requests.tsx`) matching `LocalGuide_Request.png` with Accept / Decline action handlers.
   - Implemented `GuideBookingsScreen` (`(tabs)/bookings.tsx`) matching `LocalGuide_Bookings_Upcomming.png`, `Active.png`, `Completed.png`, and `Cancelled.png` with tabbed filtering.

5. **Connect Admin (Staff Web App - React + Vite + Tailwind):**
   - Implemented responsive `AdminLayout.tsx` featuring a persistent desktop sidebar that collapses into a slide-over mobile drawer (`Admin_Menu.png`).
   - Implemented `Dashboard.tsx` (`Admin_Homepage.png`) with platform metrics cards (Active Guides, Published Tours, Completed Bookings, Pending Verifications) and verification review alerts.
   - Configured React Router routes linking Login, Dashboard, and Verification Queue.

6. **Quality & Verification Checks:**
   - `mobile/connect_user`: `npx tsc --noEmit` passed with **0 errors**.
   - `mobile/connect_guide`: `npx tsc --noEmit` passed with **0 errors**.
   - `web/connect_admin`: `npm run build` completed successfully with **0 errors**, generating production bundle.
   - `backend`: `PYTHONPATH=backend backend/venv/bin/pytest backend/tests -v` passed **11 of 11 tests** with zero failures.

### Backend Changes Needed Next (For Claude Code)
1. **Epic 6 Bookings:** DONE — `POST /api/v1/bookings` with atomic availability lock, GET `/bookings/my`, PUT cancel/complete, public `/bookings/tours`, `/bookings/guides/{id}`.
2. **Epic 7 Real-time WebSocket:** DONE — `GET/POST /chat/threads`, `GET /threads/{id}/messages`, WebSocket `/chat/ws` with JWT re-auth + participant check.
3. **Epic 8 Reviews:** DONE — `POST /reviews` restricted to completed bookings, one per booking, GET `/reviews/my`.
4. **Epic 9 Admin Management:** DONE — `GET /admin/{guides,tours,bookings,reviews,reports,metrics}`, `PUT /admin/bookings/{id}/status`, `PUT /admin/reports/{id}/status`.
5. **Phase C Mobile Wiring:** DONE — connect_user (auth, home tours, bookings/my, book/[tourId], reviews/new/[bookingId], chat/[threadId], guides/[id], guide tab, inbox) and connect_guide (dashboard overview, requests accept/decline, bookings, earnings, tour-create, inbox) all wired to real backend API.
6. **Phase C Admin Web:** DONE — all 6 remaining screens (Guides/Tours/Bookings/Reviews/Reports/Settings) wired to real backend, ESLint 9 flat config passing clean.

---

### Claude Code — 2026-11-25 (Frontend Rebuild Session)

**Phase A — Expo SDK 58 Upgrade** (committed as `4284b2c`):
- Both mobile apps: expo ^58, react-native 0.88.1, react 19.3.0, reanimated 4.7.1, gesture-handler ~3.3.0, safe-area-context ~5.11.1, screens ~4.30.1, svg 15.16.0, worklets peer
- Created square app icons (1024x1024) from `logo_connect.png`; fixed `app.json` (removed invalid top-level `splash`)
- expo-doctor: 20/20 checks pass on both apps; TypeScript strict: 0 errors on both
- Committed on its own as required

**Phase A Steps 3-4 — Env Templates + Shared Typed API Client** (committed as `e405fca`):
- `.env.example` for connect_user and connect_guide (EXPO_PUBLIC_API_URL); `.gitignore` allows `.env.example` while `.env` stays ignored
- `shared/api-client/` with openapi-typescript-generated `schema.d.ts` (41 paths) + `createApiClient()` Axios wrapper with bearer-token + token-refresh interceptors
- `@connect/shared` symlinked into both mobile apps' `node_modules`

**Phase B — Backend Epic 6-9 Endpoints** (committed as `f7e4359`):
- Models: `Review`, `Report`; migration `3_add_missing_tables` (reviews, reports, refresh_tokens, withdrawals + guide profile columns)
- Routers: bookings, reviews, chat (incl. WebSocket), admin management
- 19/19 backend tests pass (11 original + 8 new)

**Phase C — Mobile + Admin API Wiring** (committed as `6f8a061`, `318793f`, `f535eb1`, `a87d1b8`):
- connect_user: all screens wired to real backend API
- connect_guide: all screens wired to real backend API
- Admin web: all 6 remaining screens + `PUT /admin/reports/{id}/status` endpoint
- ESLint 9 flat config for admin web: 0 errors, 0 warnings
- eas.json created for both mobile apps

**Phase D — Remaining Polish:**
- Update SCREEN_MAP.md statuses from "In Progress" to "Complete" for wired screens
- E2E flows verification against live dev servers
