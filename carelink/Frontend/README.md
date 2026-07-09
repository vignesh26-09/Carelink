# CareLink — Frontend

Static HTML/CSS/Bootstrap 5/JavaScript frontend for the CareLink Healthcare Management System.

## Run
Just open `index.html` in a browser, or serve locally:
```
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Demo accounts
Login page auto-detects role from email prefix, or pick a role manually.
- `admin@carelink.com` — Clinic Admin
- `doctor@carelink.com` — Doctor
- `patient@carelink.com` — Patient

Any password works (demo). Data is stored in `localStorage`.

## Pages
- `index.html` — Landing
- `pages/login.html`, `pages/register.html`
- `pages/dashboard.html` — Role-aware dashboard
- Patient: `doctors.html`, `my-appointments.html`
- Doctor: `schedule.html`, `consultations.html`
- Admin: `manage-doctors.html`, `manage-patients.html`, `all-appointments.html`

## Reset demo data
In the browser console: `localStorage.clear(); location.reload();`
