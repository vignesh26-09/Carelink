# Phase two — care plans, invoices, and role dashboards

Implemented and verified locally on 27 September 2026.

## Patient

- Server-validated login opens the dashboard.
- Sidebar: dashboard, doctors, my bookings, medicines and invoices.
- Header shows completed consultation count.
- Book, review previous appointments, cancel queued appointments, read consultation notes.
- Review itemized medicines/instructions, quantities, prices and the consultation fee.
- Accept the invoice, explicitly confirm a demo payment, download a plain-text demo invoice.
- Medicine orders show a clearly labeled demo delivery-queued message. No real dispatch occurs.
- An in-person referral instead shows the doctor's instructions, a consultation-only invoice, and no delivery order.

## Doctor

- Header and overview show completed visits, distinct patients consulted, queued visits and in-progress visits.
- Approve and start appointments; enter diagnosis, structured medicine lines and recorded outcome.
- Mark in-person assessment required with mandatory instructions, excluding a delivery prescription.
- Add future availability and remove unbooked future slots. Slot removal is soft withdrawal to preserve history; booked slots cannot be removed.
- Slot list shows the associated patient and consultation status.
- View issued invoices, outstanding amounts, and demo-paid consultation earnings separately from medicine charges.

## Administrator

- View clinic-wide bookings and invoices.
- Show consultation counts, distinct patients consulted, doctor-recorded reported-recovery counts and referral counts.
- Break down demo gross receipts into doctor fees and medicine charges; show outstanding invoices.
- Add a doctor with name, email, initial password, specialization, consultation fee and experience. Only administrators can provision these accounts.
- Existing patient/doctor deactivation remains available and preserves appointment history.

## Data and API

- Appointment captures consultationFeeSnapshot at booking; existing appointments without a snapshot use the current fee when issuing their first invoice.
- care_invoices stores immutable line items, doctor fee, medicine total, server-calculated grand total, referral, outcome and timestamps.
- POST /api/consultations/{id}/care-plan completes an in-progress appointment and issues its invoice once.
- POST /api/appointments/{id}/accept acknowledges an invoice as the owning patient.
- POST /api/appointments/{id}/demo-pay requires acceptance and is idempotent; status becomes DEMO_PAID. It is disabled unless carelink.payments.demo-enabled=true (dev/test only by default).
- DELETE /api/schedule/slots/{id} withdraws an unbooked future slot belonging to the doctor.
- POST /api/doctors provisions a doctor as an administrator.
- GET /api/dashboard returns aggregates scoped to the authenticated role.
- Appointment and slot updates use database locks. Invoice totals cannot be supplied or changed by the patient.
- Legacy finalize endpoints remain supported for existing clients; old completed appointments without invoices stay historical and are not charged retroactively.

## Verification

- 17 backend tests passed.
- 6 Playwright browser tests passed against local PostgreSQL, including prescription acceptance/payment, invoice download, removal, admin creation and referral workflows.
- Frontend production build passed.
- Browser tests create synthetic accounts/appointments and demo financial records. Successful runs deactivate their synthetic patients/doctors; historical test records remain and contribute to clearly labeled demo totals. Interrupted runs may leave synthetic accounts active.

## Reference and remaining integrations

- User screenshot saved unchanged at references/private/phase-one-credentials.png and excluded from Git because it contains demo credentials.
- Real payment gateway/webhook verification, pharmacy inventory, delivery addresses/fulfillment, refunds, tax invoices, payouts and platform commissions are not implemented.
- Revenue means demo receipts, not real collected money or profit. Recovery is explicitly recorded by a doctor, not inferred from appointment completion.
- Medicine prices are entered by the clinician in this prototype; there is no pharmacy price catalog.
- Real email delivery still needs the user's Resend key and verified sender.
