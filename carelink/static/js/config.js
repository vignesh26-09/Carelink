/* ==========================================
   CareLink Configuration
========================================== */

const CONFIG = {

    /* Backend URL */

    BASE_URL: "http://localhost:1327",

    API_BASE_URL: "http://localhost:1327/api",

    /* Authentication */

    TOKEN_KEY: "carelink_token",

    USER_KEY: "carelink_user",

    ROLE_KEY: "carelink_role",

    /* Application */

    APP_NAME: "CareLink",

    APP_VERSION: "1.0.0",

    REQUEST_TIMEOUT: 10000

};

/* ==========================================
   API Endpoints
========================================== */

const ENDPOINTS = {

    AUTH: {

        LOGIN: "/auth/login",

        REGISTER: "/auth/register",

        CHANGE_PASSWORD: "/auth/change-password"

    },

    DOCTORS: {

        GET_ALL: "/doctors",

        GET_BY_ID: "/doctors/",

        DELETE: "/doctors/"

    },

    PATIENTS: {

        GET_ALL: "/patients",

        DELETE: "/patients/"

    },

    APPOINTMENTS: {

        BOOK: "/appointments/book",

        MY: "/appointments/my",

        ALL: "/appointments",

        CANCEL: "/appointments/cancel/"

    },

    CONSULTATIONS: {

        APPROVE: "/consultations/",

        START: "/consultations/",

        FINALIZE: "/consultations/"

    },

    SCHEDULE: {

        CREATE_SLOT: "/schedule/slots",

        MY_SLOTS: "/schedule/my",

        AVAILABLE: "/schedule/slots/"

    },

    PROFILE: {

        GET: "/profile",

        UPDATE: "/profile"

    },

    SETTINGS: {

        GET: "/settings",

        UPDATE: "/settings"

    }

};

/* ==========================================
   HTTP Status Codes
========================================== */

const STATUS = {

    SUCCESS: 200,

    CREATED: 201,

    NO_CONTENT: 204,

    BAD_REQUEST: 400,

    UNAUTHORIZED: 401,

    FORBIDDEN: 403,

    NOT_FOUND: 404,

    SERVER_ERROR: 500

};