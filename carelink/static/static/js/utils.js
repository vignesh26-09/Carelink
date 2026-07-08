/* ==========================================
   Utility Functions
========================================== */

const Utils = {

    /* Current Date */

    currentDate() {

        return new Date().toISOString().split("T")[0];

    },

    /* Current Time */

    currentTime() {

        return new Date().toLocaleTimeString();

    },

    /* Format Date */

    formatDate(date) {

        return new Date(date).toLocaleDateString();

    },

    /* Format Date & Time */

    formatDateTime(date) {

        return new Date(date).toLocaleString();

    },

    /* Capitalize */

    capitalize(text) {

        if (!text) return "";

        return text.charAt(0).toUpperCase() +
               text.slice(1).toLowerCase();

    },

    /* Generate Random ID */

    randomId(length = 8) {

        return Math.random()
            .toString(36)
            .substring(2, length + 2);

    },

    /* Delay */

    sleep(ms) {

        return new Promise(resolve => setTimeout(resolve, ms));

    },

    /* Check Empty */

    isEmpty(value) {

        return value === null ||
               value === undefined ||
               value === "";

    },

    /* Email Validation */

    isEmail(email) {

        const pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return pattern.test(email);

    },

    /* Phone Validation */

    isPhone(phone) {

        return /^[0-9]{10}$/.test(phone);

    },

    /* Number */

    isNumber(value) {

        return !isNaN(value);

    },

    /* Get Element */

    get(id) {

        return document.getElementById(id);

    },

    /* Query Selector */

    query(selector) {

        return document.querySelector(selector);

    },

    /* Query Selector All */

    queryAll(selector) {

        return document.querySelectorAll(selector);

    },

    /* Show Element */

    show(element) {

        element.style.display = "block";

    },

    /* Hide Element */

    hide(element) {

        element.style.display = "none";

    },

    /* Toggle */

    toggle(element) {

        if (element.style.display === "none") {

            element.style.display = "block";

        } else {

            element.style.display = "none";

        }

    },

    /* Reset Form */

    resetForm(formId) {

        document.getElementById(formId).reset();

    },

    /* Get Query Parameter */

    getParam(name) {

        const params = new URLSearchParams(window.location.search);

        return params.get(name);

    }

};