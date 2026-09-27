# CareLink work handoff

Resumed at the user's request on 27 September 2026. See the latest update below.

## Latest update — 27 September

### Phase two completed locally

See PHASE-TWO.md for the current feature inventory and limitations. Added sidebar workspaces, consultation counts, structured care plans, patient acceptance, demo-payment invoices/downloads, in-person referrals, slot removal, revenue breakdown and admin doctor creation. The user credential screenshot is saved under references/private and gitignored. Backend suite now has 17 passing tests; all 6 browser tests pass; frontend production build passes. Real payments, medicine dispatch and real email remain unconfigured integrations. Both app services are left running.

### Live verification completed after private startup

- User successfully ran scripts/start-local.ps1 and entered the existing database password privately. Backend now returns HTTP 200 on port 1327.
- Verified real password login for cardiologist@carelink.com, dermatologist@carelink.com, physician@carelink.com, and admin@carelink.com.
- Set carelink.demo.reset-passwords=false in the ignored local properties file after verification.
- All 5 Playwright tests now PASS against the live PostgreSQL backend: stale-session recovery/public doctors; full patient/doctor/admin journey (registration, refresh, booking, approval, consultation start/completion, patient notes, cancellation, availability creation, admin deactivation, invalidation, logout); both other doctor logins; mobile layout.
- Browser verification created synthetic test records as documented in LOCAL-RUN.md. Successful journey deactivated its synthetic patient and retained test appointment history.
- Frontend and backend are running. Proxy /api/doctors returns all 3 doctors.
- Backend tests: 13 passed; frontend production build passed (latest code unchanged since those checks).
- Remaining blocker: actual email delivery needs the user's Resend API key and verified sender configuration. No real email has been sent. Notification integration tests use mocks.
- Earlier pending/failed test descriptions below are historical; the passing live results above supersede them.

- Both app processes had stopped overnight; PostgreSQL 18 is still running.
- Frontend restarted and verified HTTP 200 at http://127.0.0.1:5173.
- Backend cannot yet restart: DB_PASSWORD and JWT_SECRET from its previous process are gone and there is no encrypted credentials file.
- Added scripts/start-local.ps1. First run privately requests the existing carelink DB password, validates it, and stores it plus a stable JWT secret encrypted for the Windows user in the gitignored .local-secrets.xml. Later runs reuse it. It does not modify the database password or terminate existing listeners. PowerShell syntax check passed; full startup awaits the user's private password entry.
- Asked user to run start-local.ps1 and reply started. Do not ask them to paste their password into chat.
- Added LOCAL-RUN.md and frontend npm ci/build to CI.
- Added 5 mocked mail-provider tests. Total backend suite now passes 13 tests; frontend production build also passes.
- Live credential verification and Playwright rerun remain pending backend startup. Temporary demo.reset-passwords remains true until all four credentials are verified, then must be set false.
- Email provider credentials/sender remain unconfigured; no actual email has been sent.

## User's intended outcome

Verify all endpoints and frontend actions; support real patient, doctor, and admin sign-in; send account details by email; prepare three doctor profiles and an admin; finish tests and leave frontend/backend running; provide the local demo credentials in chat.

## Implemented this session

- JWT filter now catches invalid/expired tokens and returns JSON 401 instead of crashing. Public doctor discovery and public slot listing ignore stale tokens.
- Added protected GET /api/auth/me. Frontend validates stored tokens against the server on refresh, clears expired sessions, and routes by the server-provided role.
- Login/register normalize email addresses. Registration requires passwords of 12–72 characters. API errors distinguish validation, authentication, authorization, missing records, and conflicts.
- Rebuilt React interaction flows: patient registration/login, role selection guidance, doctor details, booking, appointment history, cancellation confirmation, doctor scheduling, appointment approval/start/completion, diagnosis display, admin patient/doctor lists, and account deactivation.
- Request errors are displayed instead of silently becoming empty arrays.
- Added doctor fullName and three development profiles: Ananya Rao (Cardiology), Vikram Shah (Dermatology), Meera Iyer (General medicine).
- Seeder handles accounts independently, adds future available slots when no free future slots exist, and supports an explicit development-only password reset flag.
- Account deactivation retains appointment history and invalidates subsequent authenticated requests. Inactive doctors cannot receive new bookings.
- Reject past scheduling/booking, overlapping slots, invalid consultation transitions, blank diagnosis, and malformed medication entries.
- Email integration uses Resend's HTTPS API, via Java HttpClient with no extra mail library. Sends welcome/successful-sign-in notifications with email, role, and UTC time when configured. Returns NOT_CONFIGURED, ACCEPTED, FAILED, or DEVELOPMENT_ACCOUNT honestly. No email has been sent or delivery verified.
- Added repo .gitignore covering local secrets/properties, generated builds, logs, node_modules, and Playwright output.
- Added API journey tests and Playwright browser tests.

## Files and configuration

Project: Carelink-audit/carelink.
Canonical frontend directory is tracked as Frontend (Windows accepts frontend).
Local app configuration: .local-carelink.properties (gitignored; contains generated demo passwords).
Do not copy passwords into this tracked handoff or tests.

Demo email addresses:
- cardiologist@carelink.com
- dermatologist@carelink.com
- physician@carelink.com
- admin@carelink.com

IMPORTANT: .local-carelink.properties currently has carelink.demo.reset-passwords=true. This was temporarily enabled to reset the pre-existing local sample accounts to the generated credentials requested by the user. After verifying the four logins, change this flag to false so later development restarts do not keep resetting passwords.

Mail requires CARELINK_MAIL_ENABLED=true, MAIL_FROM, and RESEND_API_KEY configured privately for the backend (or matching carelink.mail.* properties). A Resend sender/provider setup is still required. Asked the user whether they prefer notifications or emailed login codes and which provider; no answer received. Implemented notifications as the stated default. Email-code login is NOT implemented. Typing an email alone does not send mail; successful registration/password login triggers the notification.

## Verification completed

- npm run build passed after the React rewrite.
- Backend suite: 8 tests passed (6 ApiJourneyTest, 1 context test, 1 consultation unit test).
- API tests cover registration/login/me, stale token/public access, role restrictions/ownership, scheduling, booking, duplicate booking rejection, cancellation and release, consultation approve/start/finalize, admin listing/deactivation, and preservation of history.
- Backend test command that works on this machine:
  & 'C:\apache-maven-3.9.16\bin\mvn.cmd' '-Dmaven.repo.local=C:\Users\tirishaanth\.m2\repository' test -q
  It needed access outside the sandbox to the existing Maven cache.
- Verified PostgreSQL backend GET /api/doctors returned all three names and specialties.
- First Playwright run: 3 passed, 2 failed. Passed stale-session recovery/public doctors, physician login/refresh, and mobile navigation. Failed complete journey due to no free cardiology slots; dermatologist login failed due to old sample password.
- Then added free future slots and enabled a one-time demo credential reset; recompiled; all 8 backend tests passed again.
- Second Playwright run began. Stale-session/public discovery test passed. User requested stop; sent Ctrl+C to the running Playwright session (72013). The remainder of this run is NOT verified. It may have created a synthetic browser patient or appointment before interruption.
- Do not claim the full browser journey or all four credentials are verified yet.

## Runtime state at pause

- Frontend had been serving http://127.0.0.1:5173/.
- Backend had been running http://127.0.0.1:1327/ with PostgreSQL 18 on 5433.
- Existing backend process used Spring DevTools to reload compiled changes and retained the user's database environment. Neither app was intentionally stopped when pausing; only the browser test was interrupted.
- Recheck runtime status when resumed. Do not assume services survive laptop/app restarts.
- scripts/setup-local-postgres.ps1 still exists but has older prompts and regenerates JWT_SECRET on each launch. It needs alignment with the current local settings; don't blindly rerun or change the user's DB password.
- A temporary Spring Mail dependency was added then removed because the running JVM did not have it; final source uses the JDK HTTP client. Mail client creation is lazy to avoid startup networking failures.

## Next work when user resumes

1. Read this note and git diff; preserve all existing edits.
2. Check frontend/backend health and inspect current test reports before repeating work.
3. Verify all four demo logins against the real backend; disable carelink.demo.reset-passwords afterward.
4. Run frontend tests: cd Frontend; npx playwright test. Installed @playwright/test; config uses locally installed Chrome, headless. Tests read demo credentials from the ignored local properties file.
5. Fix any remaining failures and complete actual UI journey: patient registration/refresh -> book -> doctor approve/start/finalize -> patient sees diagnosis -> cancel another appointment -> admin lists/deactivates synthetic patient -> session invalidation/logout.
6. Review synthetic test data from interrupted runs; do not delete real user data or deactivate the three demo doctors. Browser tests use browser-<timestamp>@carelink.test accounts.
7. Add focused concurrency checks if necessary; the current tests verify duplicate booking sequentially, not a true simultaneous race. Scheduling overlap checks are currently check-then-insert.
8. Finish email provider setup with the user's private configuration and verify a real message to their chosen address. No provider key or sender is available yet. Do not claim delivered when the provider merely accepts a message.
9. Update setup instructions/helper and CI (current workflow only runs backend tests; frontend build should be added).
10. Run final proportional checks, inspect desktop/mobile pages, leave both app services running, and give the user the verified local demo credentials from the ignored config plus an honest summary of any email limitations.

No commits, pushes, deployment, or PR creation were performed.
