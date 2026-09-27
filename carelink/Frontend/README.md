# CareLink React frontend

The active frontend is this React/Vite application. The older static copies under UI and carelink-frontend are retained only as historical references.

Run `npm ci`, then `npm run dev -- --host 127.0.0.1`. The backend must be running on port 1327. The Vite proxy forwards /api requests. See ../LOCAL-RUN.md for private database setup and starting both services.

Login validates a password against the backend. Role selection is a visual guide; authorization comes from the server. Sessions are revalidated through /api/auth/me after refresh.

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
