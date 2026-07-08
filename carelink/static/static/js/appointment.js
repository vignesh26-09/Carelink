/* ==========================================
   Appointment Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeAppointments();

});

/* ==========================================
   Initialize
========================================== */

async function initializeAppointments() {

    Auth.requireLogin();

    await loadAppointments();

}

/* ==========================================
   Load Appointments
========================================== */

async function loadAppointments() {

    Loader.show("Loading Appointments...");

    try {

        const response = await ApiService.get(
            ENDPOINTS.APPOINTMENTS.MY
        );

        displayAppointments(response.data);

    }

    catch (error) {

        Notification.error(
            error.response?.data?.error ||
            "Unable to load appointments."
        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Display Appointments
========================================== */

function displayAppointments(appointments) {

    const table =
        document.getElementById("appointmentTableBody");

    if (!table) return;

    table.innerHTML = "";

    if (appointments.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="7"
                    class="text-center">

                    No Appointments Found

                </td>

            </tr>

        `;

        return;

    }

    appointments.forEach(appointment => {

        table.innerHTML += `

            <tr>

                <td>${appointment.id}</td>

                <td>${appointment.doctor?.account?.fullName || "-"}</td>

                <td>${appointment.reasonForVisit}</td>

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

                    <button
                        class="btn btn-primary btn-sm"

                        onclick="viewAppointment(${appointment.id})">

                        View

                    </button>

                </td>

                <td>

                    ${cancelButton(appointment)}

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

            return `<span class="badge bg-success">
                        Completed
                    </span>`;

        case "CANCELLED":

            return `<span class="badge bg-danger">
                        Cancelled
                    </span>`;

        default:

            return status;

    }

}

/* ==========================================
   Cancel Button
========================================== */

function cancelButton(appointment) {

    if (
        appointment.status === "COMPLETED" ||
        appointment.status === "CANCELLED"
    ) {

        return "-";

    }

    return `

        <button
            class="btn btn-danger btn-sm"

            onclick="cancelAppointment(${appointment.id})">

            Cancel

        </button>

    `;

}

/* ==========================================
   Cancel Appointment
========================================== */

async function cancelAppointment(id) {

    if (!confirm("Cancel this appointment?")) {

        return;

    }

    Loader.show("Cancelling Appointment...");

    try {

        await ApiService.put(

            ENDPOINTS.APPOINTMENTS.CANCEL + id

        );

        Notification.success(

            "Appointment Cancelled."

        );

        loadAppointments();

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to cancel appointment."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   View Details
========================================== */

function viewAppointment(id) {

    window.location.href =

        "appointment-details.html?id=" + id;

}

/* ==========================================
   Search Appointment
========================================== */

function searchAppointment() {

    const keyword =

        document.getElementById("searchAppointment")
        .value
        .toLowerCase();

    document.querySelectorAll(

        "#appointmentTableBody tr"

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
   Filter Appointment
========================================== */

function filterAppointment(status) {

    document.querySelectorAll(

        "#appointmentTableBody tr"

    ).forEach(row => {

        if (status === "ALL") {

            row.style.display = "";

            return;

        }

        row.style.display =

            row.innerText.includes(status)

            ? ""

            : "none";

    });

}

/* ==========================================
   Refresh
========================================== */

function refreshAppointments() {

    loadAppointments();

}