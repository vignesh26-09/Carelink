/* ==========================================
   Appointment Booking
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeBooking();

});

/* ==========================================
   Initialize
========================================== */

async function initializeBooking() {

    Auth.requirePatient();

    await loadDoctors();

    const doctorId = Utils.getParam("doctorId");

    if (doctorId) {

        document.getElementById("doctor").value = doctorId;

        await loadAvailableSlots(doctorId);

    }

}

/* ==========================================
   Load Doctors
========================================== */

async function loadDoctors() {

    try {

        Loader.show("Loading Doctors...");

        const response = await ApiService.get(

            ENDPOINTS.DOCTORS.GET_ALL

        );

        const doctors = response.data;

        const doctorSelect =

            document.getElementById("doctor");

        if (!doctorSelect) return;

        doctorSelect.innerHTML =

            '<option value="">Select Doctor</option>';

        doctors.forEach(doctor => {

            doctorSelect.innerHTML += `

                <option value="${doctor.id}">

                    ${doctor.account?.fullName}
                    - ${doctor.specialization}

                </option>

            `;

        });

    }

    catch (error) {

        Notification.error(

            "Unable to load doctors."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Doctor Changed
========================================== */

async function doctorChanged() {

    const doctorId =

        document.getElementById("doctor").value;

    if (!doctorId) return;

    await loadAvailableSlots(doctorId);

}

/* ==========================================
   Load Available Slots
========================================== */

async function loadAvailableSlots(doctorId) {

    try {

        Loader.show("Loading Slots...");

        const response = await ApiService.get(

            ENDPOINTS.SCHEDULE.AVAILABLE + doctorId

        );

        displaySlots(response.data);

    }

    catch (error) {

        Notification.error(

            "Unable to load slots."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Display Slots
========================================== */

function displaySlots(slots) {

    const slotSelect =

        document.getElementById("slot");

    if (!slotSelect) return;

    slotSelect.innerHTML =

        '<option value="">Select Slot</option>';

    if (slots.length === 0) {

        slotSelect.innerHTML +=

            `<option disabled>

                No Available Slots

            </option>`;

        return;

    }

    slots.forEach(slot => {

        slotSelect.innerHTML += `

            <option value="${slot.id}">

                ${Utils.formatDateTime(
                    slot.startTime
                )}

            </option>

        `;

    });

}

/* ==========================================
   Book Appointment
========================================== */

async function bookAppointment(event) {

    event.preventDefault();

    const slotId =

        document.getElementById("slot").value;

    const reason =

        document.getElementById("reasonForVisit")
        .value
        .trim();

    if (!slotId) {

        Notification.warning(

            "Please select a slot."

        );

        return;

    }

    if (!Validator.required(reason)) {

        Notification.warning(

            "Please enter reason for visit."

        );

        return;

    }

    Loader.show("Booking Appointment...");

    try {

        await ApiService.post(

            ENDPOINTS.APPOINTMENTS.BOOK,

            {

                slotId: Number(slotId),

                reasonForVisit: reason

            }

        );

        Notification.success(

            "Appointment Booked Successfully."

        );

        document
            .getElementById("bookingForm")
            .reset();

        document
            .getElementById("slot")
            .innerHTML =
            '<option value="">Select Slot</option>';

        setTimeout(() => {

            Router.go("my-appointments.html");

        }, 1000);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Booking Failed."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Reset Form
========================================== */

function resetBooking() {

    document

        .getElementById("bookingForm")

        .reset();

}

/* ==========================================
   Back
========================================== */

function goBack() {

    window.history.back();

}