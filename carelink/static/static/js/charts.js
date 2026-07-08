/* ==========================================
   Dashboard Charts
========================================== */

const Charts = {

    appointmentsChart: null,

    /* ==============================
       Appointments by Status
    ============================== */

    appointmentStatus(data) {

        const canvas =
            document.getElementById("appointmentChart");

        if (!canvas) return;

        if (this.appointmentsChart) {

            this.appointmentsChart.destroy();

        }

        this.appointmentsChart = new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: [

                    "Pending",

                    "Confirmed",

                    "Completed",

                    "Cancelled"

                ],

                datasets: [{

                    data: [

                        data.pending,

                        data.confirmed,

                        data.completed,

                        data.cancelled

                    ]

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        });

    },

    /* ==============================
       Destroy Charts
    ============================== */

    destroy() {

        if (this.appointmentsChart) {

            this.appointmentsChart.destroy();

        }

    }

};