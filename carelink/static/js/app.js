/* ==========================================
   CareLink - Main Application
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("CareLink Application Started");

    initializeApplication();

});

/* ==========================================
   Initialize Application
========================================== */

function initializeApplication() {

    initializeLoader();

    initializeNavbar();

    initializeSidebar();

    checkAuthentication();

    loadCurrentPage();

}

/* ==========================================
   Authentication Check
========================================== */

function checkAuthentication() {

    const publicPages = [
        "login.html",
        "register.html",
        "index.html",
        "401.html",
        "403.html",
        "404.html",
        "500.html"
    ];

    const currentPage = window.location.pathname.split("/").pop();

    if (publicPages.includes(currentPage)) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    }

}

/* ==========================================
   Page Loader
========================================== */

function loadCurrentPage() {

    const page = window.location.pathname.split("/").pop();

    switch (page) {

        case "login.html":
            if (typeof initializeLogin === "function") {
                initializeLogin();
            }
            break;

        case "register.html":
            if (typeof initializeRegister === "function") {
                initializeRegister();
            }
            break;

        case "patient-dashboard.html":
        case "doctor-dashboard.html":
        case "admin-dashboard.html":
            if (typeof initializeDashboard === "function") {
                initializeDashboard();
            }
            break;

        case "doctors.html":
        case "doctor-profile.html":
            if (typeof initializeDoctor === "function") {
                initializeDoctor();
            }
            break;

        case "book-appointment.html":
        case "my-appointments.html":
        case "appointment-details.html":
            if (typeof initializeAppointment === "function") {
                initializeAppointment();
            }
            break;

        case "consultation.html":
        case "consultation-details.html":
            if (typeof initializeConsultation === "function") {
                initializeConsultation();
            }
            break;

        case "doctor-schedule.html":
            if (typeof initializeSchedule === "function") {
                initializeSchedule();
            }
            break;

        case "manage-doctors.html":
        case "manage-patients.html":
        case "all-appointments.html":
            if (typeof initializeAdmin === "function") {
                initializeAdmin();
            }
            break;

        case "profile.html":
            if (typeof initializeProfile === "function") {
                initializeProfile();
            }
            break;

        case "settings.html":
            if (typeof initializeSettings === "function") {
                initializeSettings();
            }
            break;

        default:
            console.log("No page-specific JavaScript found.");

    }

}

/* ==========================================
   Loader
========================================== */

function initializeLoader() {

    console.log("Loader Ready");

}

/* ==========================================
   Navbar
========================================== */

function initializeNavbar() {

    console.log("Navbar Ready");

}

/* ==========================================
   Sidebar
========================================== */

function initializeSidebar() {

    console.log("Sidebar Ready");

}