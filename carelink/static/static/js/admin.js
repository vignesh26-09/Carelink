/* ==========================================
   Admin Dashboard
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeAdmin();

});

/* ==========================================
   Initialize
========================================== */

async function initializeAdmin() {

    Auth.requireAdmin();

    await loadDashboardStatistics();

}

/* ==========================================
   Dashboard Statistics
========================================== */

async function loadDashboardStatistics() {

    Loader.show("Loading Dashboard...");

    try {

        const [

            doctorResponse,

            patientResponse,

            appointmentResponse

        ] = await Promise.all([

            ApiService.get(

                ENDPOINTS.DOCTORS.GET_ALL

            ),

            ApiService.get(

                ENDPOINTS.PATIENTS.GET_ALL

            ),

            ApiService.get(

                ENDPOINTS.APPOINTMENTS.ALL

            )

        ]);

        updateStatistics(

            doctorResponse.data,

            patientResponse.data,

            appointmentResponse.data

        );

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
   Update Statistics
========================================== */

function updateStatistics(

    doctors,

    patients,

    appointments

) {

    setValue(

        "doctorCount",

        doctors.length

    );

    setValue(

        "patientCount",

        patients.length

    );

    setValue(

        "appointmentCount",

        appointments.length

    );

    setValue(

        "pendingCount",

        appointments.filter(

            a => a.status === "PENDING"

        ).length

    );

}

/* ==========================================
   Helper
========================================== */

function setValue(id, value) {

    const element =

        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}

/* ==========================================
   Quick Navigation
========================================== */

function manageDoctors() {

    Router.go("manage-doctors.html");

}

function managePatients() {

    Router.go("manage-patients.html");

}

function manageAppointments() {

    Router.go("all-appointments.html");

}

/* ==========================================
   Refresh
========================================== */

function refreshDashboard() {

    loadDashboardStatistics();

}

/* ==========================================
   Logout
========================================== */

function logout() {

    Auth.logout();

}