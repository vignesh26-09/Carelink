/* ==========================================
   Axios Configuration
========================================== */

const api = axios.create({

    baseURL: CONFIG.API_BASE_URL,

    timeout: CONFIG.REQUEST_TIMEOUT,

    headers: {

        "Content-Type": "application/json"

    }

});

/* ==========================================
   Request Interceptor
========================================== */

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

/* ==========================================
   Response Interceptor
========================================== */

api.interceptors.response.use(

    function (response) {

        return response;

    },

    function (error) {

        if (error.response) {

            switch (error.response.status) {

                case STATUS.UNAUTHORIZED:

                    window.location.href = "401.html";
                    break;

                case STATUS.FORBIDDEN:

                    window.location.href = "403.html";
                    break;

                case STATUS.NOT_FOUND:

                    window.location.href = "404.html";
                    break;

                case STATUS.SERVER_ERROR:

                    window.location.href = "500.html";
                    break;

            }

        }

        return Promise.reject(error);

    }

);

/* ==========================================
   Generic API Methods
========================================== */

const ApiService = {

    get(url) {

        return api.get(url);

    },

    post(url, data) {

        return api.post(url, data);

    },

    put(url, data) {

        return api.put(url, data);

    },

    delete(url) {

        return api.delete(url);

    }

};