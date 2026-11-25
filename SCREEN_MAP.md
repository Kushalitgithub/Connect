# Connect — SCREEN_MAP.md

This document maps all 67 reference PNGs from `References/` to their target application, component, route, backend endpoints, and status.

| Reference PNG | App | Component | Route | Target Backend Endpoints | Status |
|---|---|---|---|---|---|
| `References/Cover_page/Coverpage.png` | User/Guide | `CoverScreen` | `/` | Static UI | In Progress |
| `References/Cover_page/Coverpage_second.png` | User/Guide | `WelcomeScreen` | `/welcome` | Static UI | In Progress |
| `References/Cover_page/Login_Option.png` | User/Guide | `LoginOptionSheet` | `/login` | None (Static routing) | In Progress |
| `References/Cover_page/Login_Option_scroll.png` | User/Guide | `LoginOptionSheet` (Scroll) | `/login` | None (Static routing) | In Progress |
| `References/Account_Create/Tourist_Account_Creation.png` | User | `TouristSignupScreen` | `/signup` | `POST /api/v1/auth/signup` | In Progress |
| `References/Account_Create/Tourist_Account_Creation_Scroll.png` | User | `TouristSignupScreen` (Scroll) | `/signup` | `POST /api/v1/auth/signup` | In Progress |
| `References/Account_Create/Guide_Account_creation.png` | Guide | `GuideSignupScreen` | `/signup` | `POST /api/v1/guide/auth/signup` | In Progress |
| `References/Account_Create/Guide_Account_creation_Details.png` | Guide | `GuideProfileSetupScreen` | `/profile-info` | `POST /api/v1/guide/profile` | In Progress |
| `References/Account_Create/Guide_Account_creation_IdentityVerification.png` | Guide | `GuideIdentityUploadScreen` | `/document-upload` | `POST /api/v1/guide/profile/verification` | In Progress |
| `References/Account_Create/Guide_Account_creation_IdentityVerification_Scroll.png` | Guide | `GuideIdentityUploadScreen` (Scroll) | `/document-upload` | `POST /api/v1/guide/profile/verification` | In Progress |
| `References/Account_Create/Guide_Account_creation_Document_Submission.png` | Guide | `GuideVerificationStatusScreen` | `/verification-status` | `GET /api/v1/guide/me/verification-status` | In Progress |
| `References/Tourist/Tourist_HomePage.png` | User | `TouristHomeScreen` | `/(tabs)/home` | `GET /api/v1/tours` | Complete |
| `References/Tourist/Tourist_HomePage_Scroll.png` | User | `TouristHomeScreen` (Scroll) | `/(tabs)/home` | `GET /api/v1/tours` | Complete |
| `References/Tourist/Tourist_SearchDestination.png` | User | `SearchDestinationScreen` | `/search/destinations` | `GET /api/v1/tours?destination=` | In Progress |
| `References/Tourist/Tourist_SearchDestination_Kathmandu.png` | User | `SearchDestinationScreen` (Results) | `/search/destinations` | `GET /api/v1/tours?destination=Kathmandu` | In Progress |
| `References/Tourist/Tourist_SearchDestination_Kathmandu_Scroll.png` | User | `SearchDestinationScreen` (Scroll) | `/search/destinations` | `GET /api/v1/tours?destination=Kathmandu` | In Progress |
| `References/Tourist/Tourist_ExploreGuide.png` | User | `ExploreGuideScreen` | `/(tabs)/guide` | `GET /api/v1/guides` | Complete |
| `References/Tourist/Tourist_ExploreGuide_FiltersOption.png` | User | `GuideFilterModal` | `/(tabs)/guide?filter=open` | Client filter state | In Progress |
| `References/Tourist/Tourist_ExploreGuide_Filtered.png` | User | `ExploreGuideScreen` (Filtered) | `/(tabs)/guide` | `GET /api/v1/guides` (filtered) | Complete |
| `References/Tourist/Tourist_GuideSearch_Kathmandu.png` | User | `ExploreGuideScreen` (Kathmandu) | `/(tabs)/guide?q=Kathmandu` | `GET /api/v1/guides?city=Kathmandu` | In Progress |
| `References/Tourist/Tourist_ViewGuideProfile.png` | User | `GuideProfileViewScreen` | `/guides/[id]` | `GET /api/v1/guides/{id}` | Complete |
| `References/Tourist/Tourist_ViewGuideProfile_Scroll.png` | User | `GuideProfileViewScreen` (Scroll) | `/guides/[id]` | `GET /api/v1/guides/{id}` | Complete |
| `References/Tourist/Tourist_BookGide_Date.png` | User | `BookingDateSelectModal` | `/book/[tourId]/date` | `GET /api/v1/tours/{id}/availability` | Complete |
| `References/Tourist/Tourist_BookGide_Duration.png` | User | `BookingDurationSelectModal` | `/book/[tourId]/duration` | Tour detail | Complete |
| `References/Tourist/Tourist_BookGide_NumberOfClient.png` | User | `BookingGuestsSelectModal` | `/book/[tourId]/guests` | Tour capacity check | Complete |
| `References/Tourist/Tourist_BookGide_FinalBooking.png` | User | `BookingSummaryScreen` | `/book/[tourId]/summary` | `POST /api/v1/bookings` | Complete |
| `References/Tourist/Tourist_BookGide_Booked.png` | User | `BookingConfirmationScreen` | `/book/[tourId]/confirmed` | Client state | Complete |
| `References/Tourist/Tourist_Booking_Upcoming.png` | User | `BookingsTabScreen` (Upcoming) | `/(tabs)/bookings?tab=upcoming` | `GET /api/v1/bookings/my?status=upcoming` | Complete |
| `References/Tourist/Tourist_Booking_Past.png` | User | `BookingsTabScreen` (Past) | `/(tabs)/bookings?tab=past` | `GET /api/v1/bookings/my?status=past` | Complete |
| `References/Tourist/Tourist_Profile.png` | User | `TouristProfileScreen` | `/profile` | `GET /api/v1/auth/me` | In Progress |
| `References/Tourist/Tourist_Profile_Scroll.png` | User | `TouristProfileScreen` (Scroll) | `/profile` | `GET /api/v1/auth/me` | In Progress |
| `References/Tourist/Tourist_LeavingReviewPage.png` | User | `ReviewPromptModal` | `/reviews/new/[bookingId]` | `POST /api/v1/reviews` | Complete |
| `References/Tourist/Tourist_ReviewSubmit_Page.png` | User | `ReviewFormScreen` | `/reviews/new/[bookingId]` | `POST /api/v1/reviews` | Complete |
| `References/Tourist/Tourist_ReviewSubmitted_Page.png` | User | `ReviewSuccessScreen` | `/reviews/success` | Client state | Complete |
| `References/Tourist/Tourist_LocationError_Page.png` | User | `LocationPermissionErrorState` | Component Modal | Client state | In Progress |
| `References/Guide/LocalGuide_Page.png` | Guide | `GuideDashboardScreen` | `/(tabs)/dashboard` | `GET /api/v1/guide/dashboard/overview` | Complete |
| `References/Guide/LocalGuide_Page_Scroll.png` | Guide | `GuideDashboardScreen` (Scroll) | `/(tabs)/dashboard` | `GET /api/v1/guide/dashboard/overview` | Complete |
| `References/Guide/LocalGuide_MyTours.png` | Guide | `GuideToursScreen` | `/(tabs)/dashboard/tours` | `GET /api/v1/guide/dashboard/tours` | Complete |
| `References/Guide/LocalGuide_Request.png` | Guide | `BookingRequestsScreen` | `/(tabs)/requests` | `GET /api/v1/guide/dashboard/bookings?status=pending` | Complete |
| `References/Guide/LocalGuide_Bookings_Upcomming.png` | Guide | `GuideBookingsScreen` (Upcoming) | `/(tabs)/bookings?tab=upcoming` | `GET /api/v1/guide/dashboard/bookings?status=upcoming` | Complete |
| `References/Guide/LocalGuide_Bookings_Active.png` | Guide | `GuideBookingsScreen` (Active) | `/(tabs)/bookings?tab=active` | `GET /api/v1/guide/dashboard/bookings?status=active` | Complete |
| `References/Guide/LocalGuide_Bookings_Completed.png` | Guide | `GuideBookingsScreen` (Completed) | `/(tabs)/bookings?tab=completed` | `GET /api/v1/guide/dashboard/bookings?status=completed` | Complete |
| `References/Guide/LocalGuide_Bookings_Cancelled.png` | Guide | `GuideBookingsScreen` (Cancelled) | `/(tabs)/bookings?tab=cancelled` | `GET /api/v1/guide/dashboard/bookings?status=cancelled` | Complete |
| `References/Guide/LocalGuide_Inbox.png` | Guide/User | `InboxThreadsScreen` | `/(tabs)/inbox` | `GET /api/v1/chat/threads` | Complete |
| `References/Guide/LocalGuide_Chat.png` | Guide/User | `ChatConversationScreen` | `/chat/[threadId]` | WS `/api/v1/ws/chat`, `GET messages` | Complete |
| `References/Guide/LocalGuide_Earning.png` | Guide | `GuideEarningsScreen` | `/earnings` | `GET /api/v1/guide/dashboard/earnings` | Complete |
| `References/Admin/Admin_login.png` | Admin | `AdminLoginScreen` | `/login` | `POST /api/v1/admin/auth/login` | In Progress |
| `References/Admin/Admin_Homepage.png` | Admin | `AdminDashboardScreen` | `/` | `GET /api/v1/admin/metrics` | In Progress |
| `References/Admin/Admin_Homepage_Scroll.png` | Admin | `AdminDashboardScreen` (Scroll) | `/` | `GET /api/v1/admin/metrics` | In Progress |
| `References/Admin/Admin_Menu.png` | Admin | `AdminNavigationDrawer` | Layout Drawer | Client UI | In Progress |
| `References/Admin/Admin_GuideVerification.png` | Admin | `GuideVerificationQueueScreen` | `/verifications` | `GET /api/v1/admin/verification/queue` | In Progress |
| `References/Admin/Admin_GuideVerification_Approved.png` | Admin | `VerificationDecisionModal` (Approved) | `/verifications/[id]` | `PUT /api/v1/admin/verification/{id}/approve` | In Progress |
| `References/Admin/Admin_GuideVerification_Rejected.png` | Admin | `VerificationDecisionModal` (Rejected) | `/verifications/[id]` | `PUT /api/v1/admin/verification/{id}/reject` | In Progress |
| `References/Admin/Admin_All_GuideList.png` | Admin | `GuidesManagementScreen` (All) | `/guides` | `GET /api/v1/admin/guides` | In Progress |
| `References/Admin/Admin_Pending_GuideList.png` | Admin | `GuidesManagementScreen` (Pending) | `/guides?status=pending` | `GET /api/v1/admin/guides?status=pending` | In Progress |
| `References/Admin/Admin_Verified_GuideList.png` | Admin | `GuidesManagementScreen` (Verified) | `/guides?status=verified` | `GET /api/v1/admin/guides?status=verified` | In Progress |
| `References/Admin/Admin_Suspended_GuideList.png` | Admin | `GuidesManagementScreen` (Suspended) | `/guides?status=suspended` | `GET /api/v1/admin/guides?status=suspended` | In Progress |
| `References/Admin/Admin_ALL_TourList.png` | Admin | `ToursManagementScreen` (All) | `/tours` | `GET /api/v1/admin/tours` | In Progress |
| `References/Admin/Admin_Active_TourList.png` | Admin | `ToursManagementScreen` (Active) | `/tours?status=active` | `GET /api/v1/admin/tours?status=active` | In Progress |
| `References/Admin/Admin_INActive_TourList.png` | Admin | `ToursManagementScreen` (Inactive) | `/tours?status=inactive` | `GET /api/v1/admin/tours?status=inactive` | In Progress |
| `References/Admin/Admin_UnderReview_TourList.png` | Admin | `ToursManagementScreen` (Review) | `/tours?status=review` | `GET /api/v1/admin/tours?status=review` | In Progress |
| `References/Admin/Admin_BookingList.png` | Admin | `BookingsManagementScreen` (All) | `/bookings` | `GET /api/v1/admin/bookings` | In Progress |
| `References/Admin/Admin_Booking_ActiveList.png` | Admin | `BookingsManagementScreen` (Active) | `/bookings?status=active` | `GET /api/v1/admin/bookings?status=active` | In Progress |
| `References/Admin/Admin_Booking_PendingList.png` | Admin | `BookingsManagementScreen` (Pending) | `/bookings?status=pending` | `GET /api/v1/admin/bookings?status=pending` | In Progress |
| `References/Admin/Admin_Booking_CompletedList.png` | Admin | `BookingsManagementScreen` (Completed) | `/bookings?status=completed` | `GET /api/v1/admin/bookings?status=completed` | In Progress |
| `References/Admin/Admin_Booking_CanceledList.png` | Admin | `BookingsManagementScreen` (Canceled) | `/bookings?status=canceled` | `GET /api/v1/admin/bookings?status=canceled` | In Progress |
| `References/Admin/Admin_All_ReviewList.png` | Admin | `ReviewsModerationScreen` (All) | `/reviews` | `GET /api/v1/admin/reviews` | In Progress |
| `References/Admin/Admin_Flagged_ReviewList.png` | Admin | `ReviewsModerationScreen` (Flagged) | `/reviews?flagged=true` | `GET /api/v1/admin/reviews?flagged=true` | In Progress |
| `References/Admin/Admin_ReportList.png` | Admin | `ReportsManagementScreen` | `/reports` | `GET /api/v1/admin/reports` | In Progress |
| `References/Admin/Admin_Setting_Page.png` | Admin | `AdminSettingsScreen` | `/settings` | `GET/PUT /api/v1/admin/settings` | In Progress |
| `References/Admin/Admin_Setting_Page_Scroll.png` | Admin | `AdminSettingsScreen` (Scroll) | `/settings` | `GET/PUT /api/v1/admin/settings` | In Progress |
