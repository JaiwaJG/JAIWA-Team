/* ==========================================================
   JAIWA Team
   File : assets/js/config.js
   Purpose : Global Application Configuration
   Version : 1.0.0
========================================================== */

"use strict";

/* ==========================================================
   Global Configuration
========================================================== */

const CONFIG = Object.freeze({

    /* ======================================
       Application
    ====================================== */

    APP_NAME: "JAIWA Team",

    APP_VERSION: "1.0.0",

    APP_ENV: "development",


    /* ======================================
       URLs
    ====================================== */

    BASE_URL: window.location.origin,

    API_URL: "http://localhost:5000/api",


    /* ======================================
       Authentication
    ====================================== */

    TOKEN_KEY: "jaiwa_access_token",

    REFRESH_TOKEN_KEY: "jaiwa_refresh_token",

    USER_KEY: "jaiwa_user",


    /* ======================================
       Request
    ====================================== */

    REQUEST_TIMEOUT: 10000,

    RETRY_COUNT: 1,


    /* ======================================
       UI
    ====================================== */

    TOAST_DURATION: 3000,

    REDIRECT_DELAY: 1500,


    /* ======================================
       Password
    ====================================== */

    MIN_PASSWORD_LENGTH: 8,

    MAX_PASSWORD_LENGTH: 64,


    /* ======================================
       Security
    ====================================== */

    ENABLE_DEBUG: false,

    ENABLE_LOG: false

});


/* ==========================================================
   Freeze Nested Objects (Future Ready)
========================================================== */

Object.freeze(CONFIG);


/* ==========================================================
   Read Only
========================================================== */

/*

CONFIG.APP_NAME

CONFIG.API_URL

CONFIG.TOKEN_KEY

CONFIG.REQUEST_TIMEOUT

...
*/