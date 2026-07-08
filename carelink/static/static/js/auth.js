/* ==========================================
   Authentication Utility
========================================== */

const Auth = {

    /* ==============================
       Login
    ============================== */

    async login(email, password) {

        try {

            const response = await ApiService.post(

                ENDPOINTS.AUTH.LOGIN,

                {
                    email: email,
                    password: password
                }

            );

            const data = response.data;

            Storage.saveToken(data.token);

            Storage.saveRole(data.role);

            Storage.saveUser({

                email: data.email,

                role: data.role

            });

            return data;

        }

        catch (error) {

            throw error;

        }

    },

    /* ==============================
       Register
    ============================== */

    async register(userData) {

        try {

            const response = await ApiService.post(

                ENDPOINTS.AUTH.REGISTER,

                userData

            );

            return response.data;

        }

        catch (error) {

            throw error;

        }

    },

    /* ==============================
       Logout
    ============================== */

    logout() {

        Storage.clear();

        window.location.href = "login.html";

    },

    /* ==============================
       Check Login
    ============================== */

    isLoggedIn() {

        return Storage.getToken() !== null;

    },

    /* ==============================
       Get Current User
    ============================== */

    getCurrentUser() {

        return Storage.getUser();

    },

    /* ==============================
       Get User Role
    ============================== */

    getRole() {

        return Storage.getRole();

    },

    /* ==============================
       Role Check
    ============================== */

    hasRole(role) {

        return Storage.getRole() === role;

    },

    /* ==============================
       Redirect If Not Logged In
    ============================== */

    requireLogin() {

        if (!this.isLoggedIn()) {

            window.location.href = "login.html";

        }

    },

    /* ==============================
       Admin Only
    ============================== */

    requireAdmin() {

        if (!this.hasRole("CLINIC_ADMIN")) {

            window.location.href = "403.html";

        }

    },

    /* ==============================
       Doctor Only
    ============================== */

    requireDoctor() {

        if (!this.hasRole("DOCTOR")) {

            window.location.href = "403.html";

        }

    },

    /* ==============================
       Patient Only
    ============================== */

    requirePatient() {

        if (!this.hasRole("PATIENT")) {

            window.location.href = "403.html";

        }

    }

};