# Deploy the CareLink demo on Render

This setup publishes one Spring Boot web service. The Docker build compiles the React application and serves it from the same URL as `/api`, so login and other browser requests do not need cross-origin configuration.

## Create the demo

1. Sign in to Render with the GitHub account that can access `vignesh26-09/Carelink`.
2. Select **New → Blueprint**, choose that repository and branch `main`.
3. Render detects the root `render.yaml`; keep the proposed `carelink-demo` service and `carelink-demo-db` database.
4. When asked, enter new, unique passwords (at least 12 characters) for `CARELINK_SEED_DOCTOR_PASSWORD` and `CARELINK_SEED_ADMIN_PASSWORD`. Do not reuse the local demo passwords and do not put either value in GitHub.
5. Apply the Blueprint and wait for the service URL. Open it and test patient registration plus the demo doctor/admin accounts.

The Blueprint uses Render's free plans. Its web service sleeps after inactivity and its free PostgreSQL database expires after 30 days. This is a portfolio demo, not a healthcare production deployment. Real payment, medicine delivery, compliance, backups, monitoring and email delivery are deliberately not enabled.

## After first deployment

The seed accounts are needed only to establish the demo. Keep their passwords private. When you are ready to stop re-seeding, set `CARELINK_SEED_ENABLED` to `false` in Render's service environment settings and redeploy. Never delete the database without exporting any data you care about.
