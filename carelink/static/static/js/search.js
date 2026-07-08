/* ==========================================
   Global Search
========================================== */

const Search = {

    /* Search Table */

    table(inputId, tableId) {

        const keyword =

            document.getElementById(inputId)

            .value

            .toLowerCase();

        const rows =

            document.querySelectorAll(

                "#" + tableId + " tbody tr"

            );

        rows.forEach(row => {

            row.style.display =

                row.innerText

                .toLowerCase()

                .includes(keyword)

                ? ""

                : "none";

        });

    },

    /* Search Cards */

    cards(inputId, selector) {

        const keyword =

            document.getElementById(inputId)

            .value

            .toLowerCase();

        document.querySelectorAll(selector)

            .forEach(card => {

                card.style.display =

                    card.innerText

                    .toLowerCase()

                    .includes(keyword)

                    ? ""

                    : "none";

            });

    },

    /* Clear */

    clear(inputId) {

        document.getElementById(inputId).value = "";

    }

};