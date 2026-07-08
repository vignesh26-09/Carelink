/* ==========================================
   Consultation Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeConsultation();

});

/* ==========================================
   Initialize
========================================== */

async function initializeConsultation() {

    Auth.requireDoctor();

    await loadConsultations();

}

/* ==========================================
   Load Consultations
========================================== */

async function loadConsultations() {

    Loader.show("Loading Consultations...");

    try {

        const response = await ApiService.get(

            ENDPOINTS.APPOINTMENTS.MY

        );

        displayConsultations(response.data);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to load consultations."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Display Consultations
========================================== */

function displayConsultations(appointments) {

    const table =

        document.getElementById("consultationTableBody");

    if (!table) return;

    table.innerHTML = "";

    if (appointments.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="7"
                    class="text-center">

                    No Consultations Available

                </td>

            </tr>

        `;

        return;

    }

    appointments.forEach(appointment => {

        table.innerHTML += `

            <tr>

                <td>${appointment.id}</td>

                <td>

                    ${appointment.patient?.fullName || "-"}

                </td>

                <td>

                    ${appointment.reasonForVisit}

                </td>

                <td>

                    ${Utils.formatDateTime(
                        appointment.slot.startTime
                    )}

                </td>

                <td>

                    ${statusBadge(
                        appointment.status
                    )}

                </td>

                <td>

                    ${actionButtons(appointment)}

                </td>

            </tr>

        `;

    });

}

/* ==========================================
   Status Badge
========================================== */

function statusBadge(status) {

    switch (status) {

        case "PENDING":

            return `<span class="badge bg-warning">
                        Pending
                    </span>`;

        case "CONFIRMED":

            return `<span class="badge bg-success">
                        Confirmed
                    </span>`;

        case "IN_PROGRESS":

            return `<span class="badge bg-primary">
                        In Progress
                    </span>`;

        case "COMPLETED":

            return `<span class="badge bg-secondary">
                        Completed
                    </span>`;

        default:

            return status;

    }

}

/* ==========================================
   Action Buttons
========================================== */

function actionButtons(appointment) {

    switch (appointment.status) {

        case "PENDING":

            return `

                <button
                    class="btn btn-success btn-sm"

                    onclick="approveAppointment(${appointment.id})">

                    Approve

                </button>

            `;

        case "CONFIRMED":

            return `

                <button
                    class="btn btn-primary btn-sm"

                    onclick="startConsultation(${appointment.id})">

                    Start

                </button>

            `;

        case "IN_PROGRESS":

            return `

                <button
                    class="btn btn-warning btn-sm"

                    onclick="openFinalize(${appointment.id})">

                    Complete

                </button>

            `;

        default:

            return "-";

    }

}

/* ==========================================
   Approve Appointment
========================================== */

async function approveAppointment(id) {

    Loader.show("Approving...");

    try {

        await ApiService.post(

            ENDPOINTS.CONSULTATIONS.APPROVE +

            id +

            "/approve"

        );

        Notification.success(

            "Appointment Approved."

        );

        loadConsultations();

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Approval Failed."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Start Consultation
========================================== */

async function startConsultation(id) {

    Loader.show("Starting Consultation...");

    try {

        await ApiService.post(

            ENDPOINTS.CONSULTATIONS.START +

            id +

            "/start"

        );

        Notification.success(

            "Consultation Started."

        );

        loadConsultations();

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to Start Consultation."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Open Finalize Screen
========================================== */

function openFinalize(id) {

    window.location.href =

        "consultation-details.html?id=" + id;

}

/* ==========================================
   Finalize Consultation
========================================== */

async function finalizeConsultation(event) {

    event.preventDefault();

    const id = Utils.getParam("id");

    const diagnosis =

        document.getElementById("diagnosis")
        .value
        .trim();

    const medications =

        document.getElementById("medications")
        .value
        .trim();

    if (!Validator.required(diagnosis)) {

        Notification.warning(

            "Diagnosis is required."

        );

        return;

    }

    Loader.show("Saving Consultation...");

    try {

        await ApiService.post(

            ENDPOINTS.CONSULTATIONS.FINALIZE +

            id +

            "/finalize" +

            `?diagnosis=${encodeURIComponent(diagnosis)}` +

            `&medicationsJson=${encodeURIComponent(medications)}`

        );

        Notification.success(

            "Consultation Completed."

        );

        setTimeout(() => {

            Router.go(

                "consultation.html"

            );

        }, 1000);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to Complete Consultation."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Search Consultation
========================================== */

function searchConsultation() {

    const keyword =

        document.getElementById("searchConsultation")
        .value
        .toLowerCase();

    document.querySelectorAll(

        "#consultationTableBody tr"

    ).forEach(row => {

        row.style.display =

            row.innerText
                .toLowerCase()
                .includes(keyword)

                ? ""

                : "none";

    });

}

/* ==========================================
   Refresh
========================================== */

function refreshConsultations() {

    loadConsultations();

}