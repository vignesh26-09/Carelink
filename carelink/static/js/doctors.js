/* ==========================================
   Doctors Page
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeDoctors();

});

/* ==========================================
   Initialize
========================================== */

async function initializeDoctors() {

    Auth.requireLogin();

    await loadDoctors();

}

/* ==========================================
   Load Doctors
========================================== */

async function loadDoctors() {

    Loader.show("Loading Doctors...");

    try {

        const response = await ApiService.get(

            ENDPOINTS.DOCTORS.GET_ALL

        );

        displayDoctors(response.data);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to load doctors."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Display Doctors
========================================== */

function displayDoctors(doctors) {

    const container = document.getElementById("doctorContainer");

    if (!container) return;

    container.innerHTML = "";

    if (doctors.length === 0) {

        container.innerHTML = `

            <div class="col-12">

                <div class="alert alert-info text-center">

                    No doctors available.

                </div>

            </div>

        `;

        return;

    }

    doctors.forEach(doctor => {

        container.innerHTML += `

            <div class="col-md-4 mb-4">

                <div class="card doctor-card h-100">

                    <div class="card-body text-center">

                        <img src="../images/doctor.png"
                             class="doctor-image mb-3"
                             alt="Doctor">

                        <h5>${doctor.account?.fullName || "Doctor"}</h5>

                        <p class="text-muted">

                            ${doctor.specialization}

                        </p>

                        <p>

                            Experience:
                            ${doctor.yearsOfExperience} Years

                        </p>

                        <p class="consultation-fee">

                            ₹${doctor.consultationFee}

                        </p>

                        <button
                            class="btn btn-primary"

                            onclick="viewDoctor(${doctor.id})">

                            View Profile

                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}

/* ==========================================
   Search Doctor
========================================== */

function searchDoctor() {

    const keyword = document
        .getElementById("searchDoctor")
        .value
        .toLowerCase();

    document.querySelectorAll(".doctor-card")
        .forEach(card => {

            card.style.display =
                card.innerText
                    .toLowerCase()
                    .includes(keyword)

                    ? ""

                    : "none";

        });

}

/* ==========================================
   View Doctor
========================================== */

function viewDoctor(id) {

    window.location.href =

        "doctor-profile.html?id=" + id;

}

/* ==========================================
   Refresh
========================================== */

function refreshDoctors() {

    loadDoctors();

}