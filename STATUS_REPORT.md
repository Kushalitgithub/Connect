# STATUS REPORT — Local Codebase Audit & Frontend Architecture Plan

**Date:** 2026-11-25  
**Author:** Antigravity (Frontend Lead)  
**Branch:** `frontend-rebuild` (created from local `main` HEAD)  
**Git Tag:** `local-before-rebuild` tagged on local HEAD  
**Source of Truth:** Local folder `Documents/Connect` (Remote GitHub ignored per directive)  

---

## 1. Local Git & Working Tree Status

Before starting, `git status` confirmed the local state:
- **Local Tag:** `local-before-rebuild` created on `main` HEAD (`f6072aa`).
- **Branch Created:** `frontend-rebuild` checked out cleanly without discarding any uncommitted or untracked work.
- **Staged files preserved:**
  - `mobile/connect_guide/src/app/(tabs)/bookings.tsx`
  - `mobile/connect_guide/src/app/(tabs)/inbox.tsx`
- **Unstaged modified files preserved:**
  - `PROCESS.md`, `backend/alembic.ini`, `backend/app/api/v1/*`, `backend/app/core/*`, `backend/app/models/*`, `docker-compose.yml`, `mobile/connect_guide/*`, `mobile/connect_user/*`, `web/connect_admin/src/pages/Login.tsx`.
- **Untracked files preserved:**
  - `IMPLEMENTATION_SUMMARY.md`, `References/` (all 67 PNGs), `backend/app/db/session.py`, `backend/app/models/withdrawal.py`, `backend/requirements.txt`, `backend/test_guide_dashboard.db`, `backend/tests/test_guide_dashboard/`, `mobile/connect_guide/lib/*`, `mobile/connect_guide/src/app/(tabs)/withdrawal.tsx`, `mobile/connect_guide/src/app/_layout.tsx`, `mobile/connect_user/lib/design-system/Button.tsx`, `mobile/connect_user/src/app/(auth)/_layout.tsx`.

---

## 2. Docs / TAD Audit & Technical Stack Conflicts

The TAD (`docs/Connect_TAD.md`), PRD (`docs/Connect_PRD.md`), and Security Spec (`docs/Connect_Security_Access_Spec.md`) decide the architecture. We conducted a line-by-line comparison against the prompt's target stack and the local code:

### 2.1 Stack Audit & Conflicts

| Dimension | TAD / Docs Specification | User Prompt Target Stack | Local Codebase Reality | Analysis & Recommendation |
|---|---|---|---|---|
| **Styling (Mobile)** | TAD §2: "NativeWind (Tailwind syntax for React Native) for styling, mapped from the same design tokens as Connect Admin" | React Native with NativeWind | `nativewind: ^4.2.7` and `tailwindcss: ^4.3.3` in `package.json`, but `tsconfig.json` failed on `nativewind/types` because nativewind v4 requires `react-native-css-interop` configuration. | **Recommendation:** Keep NativeWind as defined by both TAD and prompt; resolve types/config cleanly so NativeWind utility classes compile seamlessly. |
| **Icons (Mobile)** | Docs: Consistent icon system | `lucide-react-native` | Currently uses `@expo/vector-icons` (`^15.1.1`). | **Recommendation:** Install `lucide-react-native` and `react-native-svg` to match Admin (`lucide-react`) and prompt requirements. |
| **State & Data Fetching** | TAD §2: Axios for API calls | TanStack Query + Zustand + React Hook Form + Zod | `zustand` is installed in Admin. Mobile currently uses manual `useState`/`useEffect` + `lib/api.ts`. | **Recommendation:** Adopt TanStack Query + Zustand across all frontends as requested in target stack. It cleanly handles loading, error, retry, and cache synchronization without violating TAD. |
| **Payments / Earnings Withdrawal** | PRD §3: "Non-Goals (v1): In-app payments, escrow, or payouts." PRD §8: "Payment integration and payout flow (post-v1)." | "skip payments; ... Guide (multi-step signup, verification status, my tours, requests accept/decline, bookings tabs, chat/inbox, earnings)" | Backend has uncommitted `withdrawal.py` / `/withdrawal/request`, and Guide has `withdrawal.tsx` (Ticket 2.7). | **Conflict:** TAD and PRD exclude payouts/withdrawals for v1; prompt asks for earnings view while skipping payments. **Recommendation:** Keep Earnings view as a read-only balance/transaction history inspector (CN-057), and disable/hide withdrawal payout actions until payment milestone, exactly per TAD/PRD. |
| **Shared Code Structure** | TAD §3: `/backend/`, `/web/connect_admin/`, `/mobile/connect_user/`, `/mobile/connect_guide/`, `/docs/` | `shared/` for theme tokens, types, Zod schemas, and typed API client (`openapi-typescript`), never sharing UI components between RN and web. | Tokens were in `mobile/design-system/tokens.ts` and `mobile/connect_guide/lib/design-system/tokens.ts` with duplication. | **Recommendation:** Establish a top-level `shared/` folder containing tokens, Zod schemas, and TypeScript API types. Keep UI components separate per platform. |
| **Admin Web Navigation** | TAD §3, Frontend Spec §3: Desktop/tablet-first layout with persistent navigation surface covering Dashboard, Users & Guides, Verification Queue, Tours & Bookings, Reviews & Reports, Audit Log, Settings. | Admin sidebar collapsing to a drawer on mobile | `connect_admin` only had Login and VerificationQueue stub. | **Recommendation:** Implement responsive layout: persistent sidebar on desktop (>=1024px) that smoothly collapses into a slide-over mobile drawer on smaller viewports. |

---

## 3. What Exists and Works vs What is Broken / Partial / Missing

### 3.1 Backend
- **Works:**
  - FastAPI `/api/v1` routers: `admin_auth`, `admin_verification`, `auth`, `guide_auth`, `guide_dashboard`, `guide_profile`, `refresh`.
  - Database schema & Alembic migrations for `users`, `guide_profiles`, `tour_listings`, `availability`, `bookings`, `verification_audit_logs`.
  - `backend/venv/bin/pytest backend/tests -v` runs and **11 of 11 tests pass** with zero failures.
- **Partial / Missing:**
  - Realtime WebSocket endpoint `/v1/ws/chat` for chat threads and live messaging (TAD §2, Epic 7).
  - Tourist booking creation endpoint (`POST /v1/bookings`) with atomic row-locking on `availability` slots (TAD §5, CN-030/CN-031).
  - Completed review creation endpoint (`POST /v1/reviews`) enforcing `booking.status == 'completed'` (TAD §4, CN-042/CN-043).
  - Admin management endpoints for full guides list, tour moderation, reviews moderation, and platform metrics (CN-048 to CN-056).

### 3.2 Connect User (`mobile/connect_user`)
- **Works:**
  - Expo router root setup `_layout.tsx`, Auth layout `(auth)/_layout.tsx`, Login `(auth)/login/page.tsx`, Signup `(auth)/signup/page.tsx`.
  - Design system component library in `lib/design-system/` (Avatar, BottomNav, Card, HomeIndicator, Input, RatingStars, SkeletonLoader, TopStatusBar, VerifiedBadge).
- **Broken / Missing:**
  - TypeScript error TS2688 (`Cannot find type definition file for 'nativewind/types'`).
  - Missing bottom tabs: Home, Find Guide, Bookings, Inbox matching `References/Tourist/`.
  - Multi-step booking flow (Date → Duration → Number of Clients → Final Booking → Booked) is completely missing.
  - Guide search & destination search with filter sheets (`Tourist_SearchDestination.png`, `Tourist_ExploreGuide_FiltersOption.png`).
  - Booking list (Upcoming / Past tabs) and cancel action (`Tourist_Booking_Upcoming.png`, `Tourist_Booking_Past.png`).
  - Reviews submission screens (`Tourist_LeavingReviewPage.png`, `Tourist_ReviewSubmit_Page.png`, `Tourist_ReviewSubmitted_Page.png`).
  - Realtime Chat & Inbox.

### 3.3 Connect Guide (`mobile/connect_guide`)
- **Works:**
  - Auth flow (Login, Signup), Onboarding flow (profile-info, document-upload, submitted).
  - Tabs shell `(tabs)/_layout.tsx` with dashboard, requests, verification-status, bookings, inbox.
  - Design system component library in `lib/design-system/`.
- **Broken / Missing:**
  - TypeScript error TS2688 (`nativewind/types`).
  - Floating translucent bottom bar with active indicator.
  - Tour management screens (My Tours catalog, Create Tour, Availability Manager).
  - Booking Requests (Accept/Decline actions).
  - Bookings tabs (Upcoming, Active, Completed, Cancelled).
  - Live chat and earnings screens.

### 3.4 Connect Admin (`web/connect_admin`)
- **Works:**
  - Vite 5 + React 18 + Tailwind v4 build passes (`npm run build` succeeds in 3.8s, generating `dist/`).
  - Login page (`Admin_login.png`) and Verification Queue review modal (`Admin_GuideVerification.png`).
- **Missing:**
  - Dashboard overview with metrics and charts (`Admin_Homepage.png` / `Admin_Homepage_Scroll.png`).
  - Collapsible sidebar drawer (`Admin_Menu.png`).
  - Guides management tables (All, Pending, Verified, Suspended).
  - Tours management tables (All, Active, Inactive, Under Review).
  - Bookings management tables (All, Active, Pending, Completed, Canceled).
  - Reviews & Flagged reviews moderation.
  - Reports list & platform settings page.

---

## 4. Backend Endpoints vs Reference Screens Mapping

| Reference PNG | Target Screen | Backend Endpoint | Status in Local Backend |
|---|---|---|---|
| `Coverpage.png`, `Coverpage_second.png` | Splash / Welcome | None (Static) | **READY** |
| `Login_Option.png` | Login Options | None (Static) | **READY** |
| `Tourist_Account_Creation.png` | Tourist Signup | `POST /api/v1/auth/signup` | **READY** |
| `Tourist_HomePage.png` | Tourist Home | `GET /api/v1/tours` | **PARTIAL** (Tours exist in guide_dashboard, needs public endpoint) |
| `Tourist_SearchDestination.png` | Destination Search | `GET /api/v1/tours?destination=` | **PARTIAL** |
| `Tourist_ExploreGuide.png` | Explore Guides | `GET /api/v1/guides` | **PARTIAL** |
| `Tourist_ViewGuideProfile.png` | Guide Profile View | `GET /api/v1/guides/{id}` | **PARTIAL** |
| `Tourist_BookGide_Date.png` to `Booked.png` | Booking Flow | `POST /api/v1/bookings` | **MISSING** (Needs Claude Code) |
| `Tourist_Booking_Upcoming.png`, `Past.png` | Tourist Bookings | `GET /api/v1/bookings/my` | **MISSING** (Needs Claude Code) |
| `Tourist_LeavingReviewPage.png` | Review Submit | `POST /api/v1/reviews` | **MISSING** (Needs Claude Code) |
| `Guide_Account_creation.png` | Guide Signup | `POST /api/v1/guide/auth/signup` | **READY** |
| `Guide_Account_creation_Details.png` | Guide Profile Setup | `POST /api/v1/guide/profile` | **READY** |
| `Guide_Account_creation_IdentityVerification.png` | Verification Upload | `POST /api/v1/guide/profile/verification` | **READY** |
| `Guide_Account_creation_Document_Submission.png` | Verification Status | `GET /api/v1/guide/me/verification-status` | **READY** |
| `LocalGuide_Page.png` | Guide Dashboard | `GET /api/v1/guide/dashboard/overview` | **READY** |
| `LocalGuide_MyTours.png` | Guide Tours Hub | `GET /api/v1/guide/dashboard/tours` | **READY** |
| `LocalGuide_Request.png` | Booking Requests | `GET /api/v1/guide/dashboard/bookings` | **READY** |
| `LocalGuide_Bookings_*.png` | Guide Bookings Tabs | `GET /api/v1/guide/dashboard/bookings` | **READY** |
| `LocalGuide_Earning.png` | Guide Earnings | `GET /api/v1/guide/dashboard/earnings` | **READY** |
| `LocalGuide_Inbox.png`, `Chat.png` | Chat / Inbox | WS `/api/v1/ws/chat` & `GET /api/v1/chat/threads` | **MISSING** (Needs Claude Code) |
| `Admin_login.png` | Admin Login | `POST /api/v1/admin/auth/login` | **READY** |
| `Admin_Homepage.png` | Admin Dashboard | `GET /api/v1/admin/metrics` | **MISSING** (Needs Claude Code) |
| `Admin_GuideVerification*.png` | Verification Queue & Actions | `GET /api/v1/admin/verification/queue`, `PUT approve/reject` | **READY** |
| `Admin_*_GuideList.png` | Admin Guides Console | `GET /api/v1/admin/guides` | **MISSING** (Needs Claude Code) |
| `Admin_*_TourList.png` | Admin Tours Console | `GET /api/v1/admin/tours` | **MISSING** (Needs Claude Code) |
| `Admin_Booking*List.png` | Admin Bookings Console | `GET /api/v1/admin/bookings` | **MISSING** (Needs Claude Code) |
| `Admin_*ReviewList.png` | Admin Reviews Console | `GET /api/v1/admin/reviews` | **MISSING** (Needs Claude Code) |
| `Admin_ReportList.png` | Admin Reports Console | `GET /api/v1/admin/reports` | **MISSING** (Needs Claude Code) |
| `Admin_Setting_Page.png` | Admin Settings | `GET/PUT /api/v1/admin/settings` | **MISSING** (Needs Claude Code) |

---

## 5. Ordered Implementation Plan (Antigravity Frontend)

1. **Step 1: Workspace & Shared Setup**
   - Create `shared/` with tokens, Zod schemas, and types.
   - Resolve TypeScript TS2688 error in `mobile/connect_user` and `mobile/connect_guide` (fix NativeWind types declaration in tsconfig).
   - Ensure clean `npx tsc --noEmit` and build across all three projects.

2. **Step 2: Connect User (Tourist App)**
   - Setup separate entry flow: Splash → Welcome → Login / Signup (no role chooser).
   - Implement floating translucent bottom navigation: `Home`, `Find Guide`, `Bookings`, `Inbox` (orange active state, hidden on auth and booking flow).
   - Screens:
     - `TouristHomeScreen` (`Tourist_HomePage.png`)
     - `SearchDestinationScreen` with search suggestions & Kathmandu results (`Tourist_SearchDestination.png`)
     - `ExploreGuideScreen` with filter bottom sheet modal (`Tourist_ExploreGuide.png`, `FiltersOption.png`, `Filtered.png`)
     - `GuideProfileViewScreen` (`Tourist_ViewGuideProfile.png`)
     - Multi-step booking flow: Date → Duration → Number of Clients → Final Booking → Booked (`Tourist_BookGide_*.png`)
     - `BookingsTabScreen`: Upcoming and Past tabs with cancel action (`Tourist_Booking_Upcoming.png`, `Tourist_Booking_Past.png`)
     - `TouristProfileScreen` (`Tourist_Profile.png`)
     - `ReviewsScreen` (`Tourist_LeavingReviewPage.png`, `Tourist_ReviewSubmit_Page.png`, `Tourist_ReviewSubmitted_Page.png`)
     - Location error handling state (`Tourist_LocationError_Page.png`)

3. **Step 3: Connect Guide (Guide App)**
   - Setup separate entry flow: Splash → Welcome → Login / Multi-step Signup with Document Upload (`References/Account_Create/Guide_Account_creation*.png`).
   - Implement floating translucent bottom navigation: `Dashboard`, `Requests`, `Bookings`, `Inbox`.
   - Screens:
     - `GuideDashboardScreen` (`LocalGuide_Page.png`)
     - `GuideToursScreen` / My Tours catalog (`LocalGuide_MyTours.png`)
     - `BookingRequestsScreen` with Accept / Decline actions (`LocalGuide_Request.png`)
     - `GuideBookingsScreen` with Upcoming, Active, Completed, and Cancelled tabs (`LocalGuide_Bookings_*.png`)
     - `GuideEarningsScreen` (`LocalGuide_Earning.png`)
     - Verification status tracker screen (`Guide_Account_creation_Document_Submission.png`)

4. **Step 4: Connect Admin (Web App)**
   - Implement persistent desktop sidebar collapsing to mobile drawer (`Admin_Menu.png`).
   - Enhance Admin Dashboard (`Admin_Homepage.png`) with platform metrics and Recharts.
   - Verification queue review modal (`Admin_GuideVerification_Approved.png`, `Rejected.png`).
   - Management screens with TanStack Table and filtering:
     - Guides console (All, Pending, Verified, Suspended)
     - Tours console (All, Active, Inactive, Under Review)
     - Bookings console (All, Active, Pending, Completed, Canceled)
     - Reviews moderation console (All, Flagged)
     - Reports list
     - Settings page

5. **Step 5: Real-time Chat & Inbox (User & Guide)**
   - Implement chat thread list (`LocalGuide_Inbox.png`) and conversation screen (`LocalGuide_Chat.png`) with auto-reconnecting WebSocket client and message bubble components.

6. **Step 6: Quality, Polish & Verification**
   - Verify 0 lint, 0 typecheck, and 0 expo-doctor errors.
   - Record completed work and backend gaps needed in `PROCESS.md`.
