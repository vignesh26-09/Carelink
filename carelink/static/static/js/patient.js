/* ==========================================
   Patient Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializePatients();

});

/* ==========================================
   Initialize
========================================== */

async function initializePatients() {

    Auth.requireAdmin();

    await loadPatients();

}

/* ==========================================
   Load Patients
========================================== */

async function loadPatients() {

    Loader.show("Loading Patients...");

    try {

        const response = await ApiService.get(

            ENDPOINTS.PATIENTS.GET_ALL

        );

        displayPatients(response.data);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to load patients."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Display Patients
========================================== */

function displayPatients(patients) {

    const table =

        document.getElementById("patientTableBody");

    if (!table) return;

    table.innerHTML = "";

    if (patients.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="6"
                    class="text-center">

                    No Patients Found

                </td>

            </tr>

        `;

        return;

    }

    patients.forEach(patient => {

        table.innerHTML += `

            <tr>

                <td>${patient.id}</td>

                <td>${patient.fullName}</td>

                <td>${patient.account?.email}</td>

                <td>${patient.bloodGroup}</td>

                <td>${patient.emergencyContact}</td>

                <td>

                    <button
                        class="btn btn-danger btn-sm"

                        onclick="deletePatient(${patient.id})">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

}

/* ==========================================
   Delete Patient
========================================== */

async function deletePatient(id) {

    if (!confirm("Delete this patient?")) {

        return;

    }

    Loader.show("Deleting Patient...");

    try {

        await ApiService.delete(

            ENDPOINTS.PATIENTS.DELETE + id

        );

        Notification.success(

            "Patient Deleted."

        );

        loadPatients();

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to delete patient."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Search Patient
========================================== */

function searchPatient() {

    const keyword =

        document.getElementById("searchPatient")
        .value
        .toLowerCase();

    document.querySelectorAll(

        "#patientTableBody tr"

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

function refreshPatients() {

    loadPatients();

}