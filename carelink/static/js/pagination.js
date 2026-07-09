/* ==========================================
   Pagination Utility
========================================== */

const Pagination = {

    currentPage: 1,

    rowsPerPage: 10,

    rows: [],

    tableBody: null,

    totalPages: 0,

    /* ==============================
       Initialize
    ============================== */

    init(tableBodyId, rowsPerPage = 10) {

        this.tableBody = document.getElementById(tableBodyId);

        if (!this.tableBody) return;

        this.rowsPerPage = rowsPerPage;

        this.rows = Array.from(this.tableBody.querySelectorAll("tr"));

        this.totalPages = Math.ceil(

            this.rows.length / this.rowsPerPage

        );

        this.showPage(1);

        this.renderControls();

    },

    /* ==============================
       Show Page
    ============================== */

    showPage(page) {

        this.currentPage = page;

        const start =

            (page - 1) * this.rowsPerPage;

        const end =

            start + this.rowsPerPage;

        this.rows.forEach((row, index) => {

            row.style.display =

                index >= start && index < end

                ? ""

                : "none";

        });

        this.updateButtons();

    },

    /* ==============================
       Previous
    ============================== */

    previous() {

        if (this.currentPage > 1) {

            this.showPage(this.currentPage - 1);

        }

    },

    /* ==============================
       Next
    ============================== */

    next() {

        if (this.currentPage < this.totalPages) {

            this.showPage(this.currentPage + 1);

        }

    },

    /* ==============================
       Render Controls
    ============================== */

    renderControls() {

        const container =

            document.getElementById("pagination");

        if (!container) return;

        container.innerHTML = `

            <button
                id="prevPage"
                class="btn btn-outline-primary btn-sm">

                Previous

            </button>

            <span
                id="pageInfo"
                class="mx-3">

            </span>

            <button
                id="nextPage"
                class="btn btn-outline-primary btn-sm">

                Next

            </button>

        `;

        document
            .getElementById("prevPage")
            .onclick = () => this.previous();

        document
            .getElementById("nextPage")
            .onclick = () => this.next();

        this.updateButtons();

    },

    /* ==============================
       Update Buttons
    ============================== */

    updateButtons() {

        const info =

            document.getElementById("pageInfo");

        if (info) {

            info.innerHTML =

                `Page ${this.currentPage}
                 of ${this.totalPages}`;

        }

        const prev =

            document.getElementById("prevPage");

        const next =

            document.getElementById("nextPage");

        if (prev)

            prev.disabled =

                this.currentPage === 1;

        if (next)

            next.disabled =

                this.currentPage === this.totalPages;

    }

};