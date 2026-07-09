/* ==========================================
   Loader
========================================== */

const Loader = {

    /* Show Loader */

    show(text = "Please wait...") {

        let loader =
            document.getElementById("loaderWrapper");

        if (!loader) {

            loader = document.createElement("div");

            loader.id = "loaderWrapper";

            loader.className =
                "loader-wrapper show";

            loader.innerHTML = `

                <div class="loader-container">

                    <div class="loader"></div>

                    <div class="loader-text">

                        ${text}

                    </div>

                </div>

            `;

            document.body.appendChild(loader);

        }

        else {

            loader.classList.add("show");

            loader.querySelector(".loader-text").textContent =
                text;

        }

    },

    /* Hide Loader */

    hide() {

        const loader =
            document.getElementById("loaderWrapper");

        if (loader) {

            loader.classList.remove("show");

        }

    },

    /* Toggle */

    toggle() {

        const loader =
            document.getElementById("loaderWrapper");

        if (!loader) return;

        loader.classList.toggle("show");

    }

};