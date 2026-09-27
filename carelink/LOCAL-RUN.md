# Running CareLink locally

PostgreSQL 18 must be running on port 5433 with the existing carelink user and carelink_database.

Run scripts/start-local.ps1 in Windows PowerShell. The first run asks for the existing carelink database password (not the postgres administrator password). It validates the connection and saves the password and a stable JWT signing key with Windows user encryption in .local-secrets.xml, which Git ignores. Later runs reuse them. Do not share this file; another Windows account cannot decrypt it.

The launcher starts the backend at http://127.0.0.1:1327 and frontend at http://127.0.0.1:5173. Startup logs are backend-out.log, backend-err.log, and Frontend/frontend-*.log. It does not stop an existing listener or change database passwords.

The older setup-local-postgres.ps1 is only for initial database provisioning; it changes the carelink database password. Use start-local.ps1 for normal restarts.

## Demo accounts

The three doctors are cardiologist@carelink.com, dermatologist@carelink.com, and physician@carelink.com. Administrator: admin@carelink.com.
Generated local passwords are in the ignored .local-carelink.properties file. This file is not a production configuration.
The temporary carelink.demo.reset-passwords flag should be false after credential verification.

## Email notifications

Notifications are sent after successful password sign-in or patient registration. This is not passwordless login or email verification. No medical notes or passwords are sent.

Configure a Resend account and sender, then supply these backend settings in the ignored .local-carelink.properties file:

    carelink.mail.enabled=true
    carelink.mail.from=CareLink <your-verified-sender@your-domain>
    carelink.mail.api-key=YOUR_PRIVATE_RESEND_KEY

Alternatively set CARELINK_MAIL_ENABLED, MAIL_FROM, and RESEND_API_KEY in the environment used to launch the backend. Restart the backend after configuration. Never commit a real key.

API reference: https://resend.com/docs/api-reference/emails/send-email

The provider may accept a message without delivering it to the inbox. Actual delivery must be verified separately. Notification failure does not lock a user out. Synthetic .test addresses and the four local demo accounts are excluded from delivery.

## Verification

Backend: mvn test (uses isolated H2; no live patient data).
Frontend build: cd Frontend; npm run build.
Browser flows: cd Frontend; npx playwright test.

Browser tests require both services, local Chrome, and the seeded credentials in .local-carelink.properties. They create synthetic browser-<timestamp>@carelink.test patients, appointments, and a future slot in the local PostgreSQL database. They deactivate their synthetic patient at the end; they do not remove clinical history. An interrupted run can leave test fixtures active. Use only a development database.

The GitHub workflow runs backend tests and the frontend build. Browser flows are local and require the configured database and demo accounts.
