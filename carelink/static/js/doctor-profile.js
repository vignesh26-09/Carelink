/* ==========================================
   Doctor Profile
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeDoctorProfile();

});

/* ==========================================
   Initialize
========================================== */

async function initializeDoctorProfile() {

    Auth.requireLogin();

    const doctorId = Utils.getParam("id");

    if (!doctorId) {

        Notification.error("Doctor not found.");

        return;

    }

    await loadDoctorProfile(doctorId);

}

/* ==========================================
   Load Profile
========================================== */

async function loadDoctorProfile(id) {

    Loader.show("Loading Profile...");

    try {

        const response = await ApiService.get(

            ENDPOINTS.DOCTORS.GET_BY_ID + id

        );

        displayDoctor(response.data);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to load doctor."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Display Doctor
========================================== */

function displayDoctor(doctor) {

    setValue("doctorName",
        doctor.account?.fullName || "Doctor");

    setValue("doctorEmail",
        doctor.account?.email);

    setValue("specialization",
        doctor.specialization);

    setValue("experience",
        doctor.yearsOfExperience + " Years");

    setValue("consultationFee",
        "₹" + doctor.consultationFee);

}

/* ==========================================
   Helper
========================================== */

function setValue(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}

/* ==========================================
   Book Appointment
========================================== */

function bookAppointment(id) {

    window.location.href =

        "book-appointment.html?doctorId=" + id;

}

/* ==========================================
   Back
========================================== */

function goBack() {

    window.history.back();

}