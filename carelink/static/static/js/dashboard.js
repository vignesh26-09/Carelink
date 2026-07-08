/* ==========================================
   Dashboard Page
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});

/* ==========================================
   Initialize Dashboard
========================================== */

async function initializeDashboard() {

    Auth.requireLogin();

    loadUserInformation();

    await loadDashboard();

}

/* ==========================================
   Load User Information
========================================== */

function loadUserInformation() {

    const user = Storage.getUser();

    if (!user) return;

    const userName = document.getElementById("userName");

    const userEmail = document.getElementById("userEmail");

    const userRole = document.getElementById("userRole");

    if (userName)
        userName.textContent = user.fullName || "User";

    if (userEmail)
        userEmail.textContent = user.email;

    if (userRole)
        userRole.textContent = user.role;

}

/* ==========================================
   Load Dashboard Data
========================================== */

async function loadDashboard() {

    Loader.show("Loading Dashboard...");

    try {

        const role = Storage.getRole();

        switch (role) {

            case "PATIENT":

                await loadPatientDashboard();

                break;

            case "DOCTOR":

                await loadDoctorDashboard();

                break;

            case "CLINIC_ADMIN":

                await loadAdminDashboard();

                break;

            default:

                Notification.error("Invalid User Role.");

        }

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to load dashboard."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Patient Dashboard
========================================== */

async function loadPatientDashboard() {

    const response = await ApiService.get(

        ENDPOINTS.APPOINTMENTS.MY

    );

    const appointments = response.data;

    updateStatistics({

        total: appointments.length,

        pending: appointments.filter(

            a => a.status === "PENDING"

        ).length,

        completed: appointments.filter(

            a => a.status === "COMPLETED"

        ).length

    });

    displayRecentAppointments(appointments);

}

/* ==========================================
   Doctor Dashboard
========================================== */

async function loadDoctorDashboard() {

    const response = await ApiService.get(

        ENDPOINTS.APPOINTMENTS.MY

    );

    const appointments = response.data;

    updateStatistics({

        total: appointments.length,

        pending: appointments.filter(

            a => a.status === "PENDING"

        ).length,

        completed: appointments.filter(

            a => a.status === "COMPLETED"

        ).length

    });

    displayRecentAppointments(appointments);

}

/* ==========================================
   Admin Dashboard
========================================== */

async function loadAdminDashboard() {

    const response = await ApiService.get(

        ENDPOINTS.APPOINTMENTS.ALL

    );

    const appointments = response.data;

    updateStatistics({

        total: appointments.length,

        pending: appointments.filter(

            a => a.status === "PENDING"

        ).length,

        completed: appointments.filter(

            a => a.status === "COMPLETED"

        ).length

    });

    displayRecentAppointments(appointments);

}

/* ==========================================
   Update Statistics
========================================== */

function updateStatistics(stats) {

    const total = document.getElementById("totalAppointments");

    const pending = document.getElementById("pendingAppointments");

    const completed = document.getElementById("completedAppointments");

    if (total)
        total.textContent = stats.total;

    if (pending)
        pending.textContent = stats.pending;

    if (completed)
        completed.textContent = stats.completed;

}

/* ==========================================
   Display Recent Appointments
========================================== */

function displayRecentAppointments(appointments) {

    const tbody = document.getElementById("appointmentTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (appointments.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="5" class="text-center">

                    No appointments found.

                </td>

            </tr>

        `;

        return;

    }

    appointments.slice(0, 5).forEach(appointment => {

        tbody.innerHTML += `

            <tr>

                <td>${appointment.id}</td>

                <td>${appointment.reasonForVisit}</td>

                <td>${appointment.status}</td>

                <td>${Utils.formatDateTime(appointment.slot.startTime)}</td>

                <td>

                    <button
                        class="btn btn-primary btn-sm"
                        onclick="viewAppointment(${appointment.id})">

                        View

                    </button>

                </td>

            </tr>

        `;

    });

}

/* ==========================================
   View Appointment
========================================== */

function viewAppointment(id) {

    window.location.href =
        "appointment-details.html?id=" + id;

}

/* ==========================================
   Refresh Dashboard
========================================== */

function refreshDashboard() {

    loadDashboard();

}

/* ==========================================
   Logout
========================================== */

function logout() {

    Auth.logout();

}