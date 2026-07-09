/* ==========================================
   Notifications
========================================== */

const Notification = {

    /* Success */

    success(message) {

        this.show(message, "success");

    },

    /* Error */

    error(message) {

        this.show(message, "danger");

    },

    /* Warning */

    warning(message) {

        this.show(message, "warning");

    },

    /* Info */

    info(message) {

        this.show(message, "primary");

    },

    /* Show Bootstrap Toast */

    show(message, type) {

        let container =
            document.getElementById("toastContainer");

        if (!container) {

            container = document.createElement("div");

            container.id = "toastContainer";

            container.className =
                "toast-container position-fixed top-0 end-0 p-3";

            document.body.appendChild(container);

        }

        const id = "toast" + Date.now();

        container.insertAdjacentHTML(

            "beforeend",

            `
            <div id="${id}"
                 class="toast text-bg-${type} border-0"
                 role="alert">

                <div class="d-flex">

                    <div class="toast-body">

                        ${message}

                    </div>

                    <button
                        type="button"
                        class="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast">
                    </button>

                </div>

            </div>
            `

        );

        const toastElement =
            document.getElementById(id);

        const toast =
            new bootstrap.Toast(toastElement);

        toast.show();

        toastElement.addEventListener(

            "hidden.bs.toast",

            () => toastElement.remove()

        );

    }

};