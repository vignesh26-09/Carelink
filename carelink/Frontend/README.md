# CareLink React frontend

The active frontend is this React/Vite application. The older static copies under UI and carelink-frontend are retained only as historical references.

Run `npm ci`, then `npm run dev -- --host 127.0.0.1`. The backend must be running on port 1327. The Vite proxy forwards /api requests. See ../LOCAL-RUN.md for private database setup and starting both services.

Login validates a password against the backend. Role selection is a visual guide; authorization comes from the server. Sessions are revalidated through /api/auth/me after refresh.

## Automatic updates and personal details

Dashboards, available slots, doctor lists and admin accounts refresh asynchronously every three seconds. Successful actions broadcast a refresh hint to other tabs on the same origin (no tokens or medical data are broadcast). Other browser sessions see updates through polling. Focus/network recovery triggers another refresh; slow or failed requests retry while retaining the last successful data. This is near-live polling, not WebSockets, and background browser throttling can delay it.

Requests are coalesced and cancelled on unmount; prescription drafts survive background refreshes. Headers show current and completed consultations, a named greeting, and a private My profile section. Click/status animations respect reduced-motion preferences.

Login tokens now use sessionStorage, so patient and doctor tabs can keep separate logins through reloads. Existing localStorage logins are no longer used: sign in again once in each tab. Closing the tab ends its stored session; duplicating a tab may initially copy its login. Server authorization still determines permissions.

## Workspaces

- Patient: dashboard counts, doctor directory, bookings/history, consultation notes, prescription acceptance, itemized invoices and downloads.
- Doctor: queue/in-progress/completed bookings, approval, consultations, priced medicine lines and instructions, in-person referrals, availability creation/removal, completed consultation counts and demo earnings.
- Administrator: clinic bookings, consultation and reported-recovery counts, doctor/medicine revenue breakdown, account creation and deactivation.

## Payments and medicine delivery

Payment is explicitly a development simulation. No cards are requested, no money is collected, and no medicine is dispatched.
A completed care plan creates an immutable invoice. The patient accepts it before demo payment. Amounts are calculated by the server, including the fee captured at booking and each medicine quantity times its unit price.
Repeated demo-payment requests do not create additional payments. In-person referrals produce fee-only invoices and no delivery order.
Real gateway callbacks, pharmacy stock/pricing, addresses, fulfillment, refunds, tax invoices, commissions and settlement are not implemented.

## Checks

- `npm run build`: production compilation.
- `npx playwright test`: browser journeys against the development PostgreSQL backend. Requires installed Chrome and ignored local demo configuration.
- Tests create synthetic patients/doctors and preserve test appointment records. They deactivate their synthetic accounts on successful completion.

The user-provided phase-one credential screenshot is retained in ../references/private and excluded from Git.
