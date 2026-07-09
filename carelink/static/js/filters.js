/* ==========================================
   Filters
========================================== */

const Filter = {

    /* Status Filter */

    status(tableId, status) {

        const rows =

            document.querySelectorAll(

                "#" + tableId + " tbody tr"

            );

        rows.forEach(row => {

            if (status === "ALL") {

                row.style.display = "";

                return;

            }

            row.style.display =

                row.innerText

                .includes(status)

                ? ""

                : "none";

        });

    },

    /* Date Filter */

    date(tableId, columnIndex, date) {

        const rows =

            document.querySelectorAll(

                "#" + tableId + " tbody tr"

            );

        rows.forEach(row => {

            const value =

                row.cells[columnIndex]

                ?.innerText || "";

            row.style.display =

                value.includes(date)

                ? ""

                : "none";

        });

    },

    /* Reset */

    reset(tableId) {

        document.querySelectorAll(

            "#" + tableId + " tbody tr"

        ).forEach(row => {

            row.style.display = "";

        });

    }

};