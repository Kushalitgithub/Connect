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