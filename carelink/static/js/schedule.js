/* ==========================================
   Doctor Schedule Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeSchedule();

});

/* ==========================================
   Initialize
========================================== */

async function initializeSchedule() {

    Auth.requireDoctor();

    await loadSchedule();

}

/* ==========================================
   Load Schedule
========================================== */

async function loadSchedule() {

    Loader.show("Loading Schedule...");

    try {

        const response = await ApiService.get(

            ENDPOINTS.SCHEDULE.MY_SLOTS

        );

        displaySchedule(response.data);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to load schedule."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Display Schedule
========================================== */

function displaySchedule(slots) {

    const tbody =

        document.getElementById("scheduleTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (slots.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6"
                    class="text-center">

                    No Schedule Available

                </td>

            </tr>

        `;

        return;

    }

    slots.forEach(slot => {

        tbody.innerHTML += `

            <tr>

                <td>${slot.id}</td>

                <td>

                    ${Utils.formatDateTime(slot.startTime)}

                </td>

                <td>

                    ${Utils.formatDateTime(slot.endTime)}

                </td>

                <td>

                    ${slot.booked
                        ? '<span class="badge bg-danger">Booked</span>'
                        : '<span class="badge bg-success">Available</span>'
                    }

                </td>

                <td>

                    ${slot.booked ? "Yes" : "No"}

                </td>

                <td>

                    ${slot.booked ? "-" :

                        `<button
                            class="btn btn-danger btn-sm"
                            onclick="deleteSlot(${slot.id})">

                            Delete

                        </button>`

                    }

                </td>

            </tr>

        `;

    });

}

/* ==========================================
   Create Slot
========================================== */

async function createSlot(event) {

    event.preventDefault();

    const start =

        document.getElementById("startTime").value;

    const end =

        document.getElementById("endTime").value;

    if (!Validator.required(start) ||

        !Validator.required(end)) {

        Notification.warning(

            "Please fill all fields."

        );

        return;

    }

    Loader.show("Creating Slot...");

    try {

        await ApiService.post(

            ENDPOINTS.SCHEDULE.CREATE_SLOT +

            `?start=${encodeURIComponent(start)}` +

            `&end=${encodeURIComponent(end)}`

        );

        Notification.success(

            "Schedule Created Successfully."

        );

        document

            .getElementById("scheduleForm")

            .reset();

        loadSchedule();

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to create slot."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Delete Slot
========================================== */

async function deleteSlot(id) {

    if (!confirm("Delete this schedule slot?")) {

        return;

    }

    Loader.show("Deleting Slot...");

    try {

        await ApiService.delete(

            ENDPOINTS.SCHEDULE.CREATE_SLOT +

            "/" +

            id

        );

        Notification.success(

            "Schedule Deleted."

        );

        loadSchedule();

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to delete slot."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Search Schedule
========================================== */

function searchSchedule() {

    const keyword =

        document.getElementById("searchSchedule")
        .value
        .toLowerCase();

    document.querySelectorAll(

        "#scheduleTableBody tr"

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
   Filter Schedule
========================================== */

function filterSchedule(status) {

    document.querySelectorAll(

        "#scheduleTableBody tr"

    ).forEach(row => {

        if (status === "ALL") {

            row.style.display = "";

            return;

        }

        const booked =

            row.innerText.includes("Booked");

        if (status === "BOOKED") {

            row.style.display =

                booked ? "" : "none";

        }

        else if (status === "AVAILABLE") {

            row.style.display =

                booked ? "none" : "";

        }

    });

}

/* ==========================================
   Refresh
========================================== */

function refreshSchedule() {

    loadSchedule();

}

/* ==========================================
   Clear Form
========================================== */

function resetSchedule() {

    document

        .getElementById("scheduleForm")

        .reset();

}