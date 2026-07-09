# CareLink — Frontend (wired to Spring Boot backend)

Static HTML / CSS / Bootstrap 5 / JavaScript frontend. All data comes from your Spring Boot API via `fetch` + JWT bearer tokens.

## Configure the backend URL
Default is `http://localhost:8080`. Change any time via the gear icon in the navbar (or the API settings link on the login page). Value is stored in `localStorage` as `cl_api`.

Make sure your `SecurityConfig` CORS allows the origin you serve the frontend from (e.g. `http://localhost:5173` or `http://127.0.0.1:8000`).

## Run
```
python3 -m http.server 5173
```
Then open http://localhost:5173

## Endpoints wired

| Feature | Method | URL |
|---|---|---|
| Login | POST | `/api/auth/login` |
| Register patient | POST | `/api/auth/register` |
| List doctors (public) | GET | `/api/doctors` |
| Delete doctor (admin) | DELETE | `/api/doctors/{id}` |
| List patients (admin) | GET | `/api/patients` |
| Delete patient (admin) | DELETE | `/api/patients/{id}` |
| Create slot (doctor) | POST | `/api/schedule/slots?start=&end=` |
| Available slots of doctor | GET | `/api/schedule/slots/{doctorId}` |
| My slots (doctor) | GET | `/api/schedule/my` |
| Book appointment (patient) | POST | `/api/appointments/book` |
| Cancel appointment | PUT | `/api/appointments/cancel/{id}` |
| My appointments | GET | `/api/appointments/my` |
| All appointments (admin) | GET | `/api/appointments` |
| Approve appointment (doctor) | POST | `/api/consultations/{id}/approve` |
| Start consultation (doctor) | POST | `/api/consultations/{id}/start` |
| Finalize consultation (doctor) | POST | `/api/consultations/{id}/finalize?diagnosis=&medicationsJson=` |

## Pages
- `index.html` — Landing
- `pages/login.html`, `pages/register.html`
- `pages/dashboard.html` — Role-aware dashboard
- Patient: `doctors.html`, `my-appointments.html`
- Doctor: `schedule.html`, `consultations.html`
- Admin: `manage-doctors.html`, `manage-patients.html`, `all-appointments.html`
