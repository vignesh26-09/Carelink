/* ==========================================
   Axios Configuration (Embedded)
========================================== */
const api = axios.create({
    baseURL: CONFIG.API_BASE_URL,
    timeout: CONFIG.REQUEST_TIMEOUT,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        if (token) {
            config.headers.Authorization = "Bearer " + token;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        const currentPage = window.location.pathname.split("/").pop();
        if (error.response) {
            if (currentPage === "login.html" || currentPage === "register.html") {
                return Promise.reject(error);
            }
            switch (error.response.status) {
                case STATUS.UNAUTHORIZED: window.location.href = "401.html"; break;
                case STATUS.FORBIDDEN: window.location.href = "403.html"; break;
                case STATUS.NOT_FOUND: window.location.href = "404.html"; break;
                case STATUS.SERVER_ERROR: window.location.href = "500.html"; break;
            }
        }
        return Promise.reject(error);
    }
);

const ApiService = {
    get(url) { return api.get(url); },
    post(url, data) { return api.post(url, data); },
    put(url, data) { return api.put(url, data); },
    delete(url) { return api.delete(url); }
};

window.ApiService = ApiService;

/* ==========================================
   Authentication Utility
========================================== */
const Auth = {
    async login(email, password) {
        try {
            const response = await ApiService.post(
                ENDPOINTS.AUTH.LOGIN,
                { email: email, password: password }
            );

            const data = response.data;

            // Save using our updated Storage methods
            Storage.saveToken(data.token);
            Storage.saveRole(data.role);
            Storage.saveUser({
                email: data.email,
                role: data.role
            });

            return data;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await ApiService.post(ENDPOINTS.AUTH.REGISTER, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        Storage.clear();
        window.location.href = "login.html";
    },

    isLoggedIn() { return Storage.getToken() !== null; },
    getCurrentUser() { return Storage.getUser(); },
    getRole() { return Storage.getRole(); },
    hasRole(role) { return Storage.getRole() === role; },
    
    requireLogin() {
        if (!this.isLoggedIn()) window.location.href = "login.html";
    },
    requireAdmin() {
        if (!this.hasRole("CLINIC_ADMIN")) window.location.href = "403.html";
    },
    requireDoctor() {
        if (!this.hasRole("DOCTOR")) window.location.href = "403.html";
    },
    requirePatient() {
        if (!this.hasRole("PATIENT")) window.location.href = "403.html";
    }
};

window.Auth = Auth;