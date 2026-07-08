/* ==========================================
   Router Utility
========================================== */

const Router = {

    /* Navigate */

    go(page) {

        window.location.href = page;

    },

    /* Back */

    back() {

        window.history.back();

    },

    /* Reload */

    reload() {

        window.location.reload();

    },

    /* Home */

    home() {

        this.go("index.html");

    },

    /* Login */

    login() {

        this.go("login.html");

    },

    /* Dashboard Based on Role */

    dashboard() {

        const role = Storage.getRole();

        switch (role) {

            case "PATIENT":
                this.go("patient-dashboard.html");
                break;

            case "DOCTOR":
                this.go("doctor-dashboard.html");
                break;

            case "CLINIC_ADMIN":
                this.go("admin-dashboard.html");
                break;

            default:
                this.login();

        }

    },

    /* Logout */

    logout() {

        Storage.clear();

        this.login();

    },

    /* Error Pages */

    unauthorized() {

        this.go("401.html");

    },

    forbidden() {

        this.go("403.html");

    },

    notFound() {

        this.go("404.html");

    },

    serverError() {

        this.go("500.html");

    }

};