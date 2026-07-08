/* ==========================================
   Local Storage Utility
========================================== */

const Storage = {

    /* Save Token */

    saveToken(token) {

        localStorage.setItem(CONFIG.TOKEN_KEY, token);

    },

    /* Get Token */

    getToken() {

        return localStorage.getItem(CONFIG.TOKEN_KEY);

    },

    /* Remove Token */

    removeToken() {

        localStorage.removeItem(CONFIG.TOKEN_KEY);

    },

    /* Save User */

    saveUser(user) {

        localStorage.setItem(
            CONFIG.USER_KEY,
            JSON.stringify(user)
        );

    },

    /* Get User */

    getUser() {

        const user = localStorage.getItem(CONFIG.USER_KEY);

        return user ? JSON.parse(user) : null;

    },

    /* Remove User */

    removeUser() {

        localStorage.removeItem(CONFIG.USER_KEY);

    },

    /* Save Role */

    saveRole(role) {

        localStorage.setItem(CONFIG.ROLE_KEY, role);

    },

    /* Get Role */

    getRole() {

        return localStorage.getItem(CONFIG.ROLE_KEY);

    },

    /* Remove Role */

    removeRole() {

        localStorage.removeItem(CONFIG.ROLE_KEY);

    },

    /* Clear Everything */

    clear() {

        localStorage.removeItem(CONFIG.TOKEN_KEY);

        localStorage.removeItem(CONFIG.USER_KEY);

        localStorage.removeItem(CONFIG.ROLE_KEY);

    }

};