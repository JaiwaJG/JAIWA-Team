/* ==========================================================
   JAIWA Team
   File : assets/js/guard.js
   Purpose : Route Protection
   Version : 1.0.0
========================================================== */

"use strict";

/* ==========================================================
   Namespace
========================================================== */

const Guard = {};

/* ==========================================================
   Authentication
========================================================== */

Guard.isAuthenticated = function(){

    const token = Storage.getToken();

    return !!token;

};


/* ==========================================================
   Protected Pages
========================================================== */

Guard.requireAuth = function(){

    if(

        !Guard.isAuthenticated()

    ){

        window.location.replace(

            "../Login/"

        );

    }

};


/* ==========================================================
   Guest Pages
========================================================== */

Guard.requireGuest = function(){

    if(

        Guard.isAuthenticated()

    ){

        window.location.replace(

            "../Dashboard/"

        );

    }

};


/* ==========================================================
   Logout
========================================================== */

Guard.logout = function(){

    Storage.removeToken();

    Storage.removeUser();

    sessionStorage.clear();

    window.location.replace(

        "../Login/"

    );

};


/* ==========================================================
   Auto Redirect
========================================================== */

Guard.auto = function(){

    const page =

        window.location.pathname.toLowerCase();


    const guestPages = [

        "/login/",

        "/register/",

        "/forgotpassword/",

        "/resetpassword/",

        "/verifyemail/"

    ];


    const isGuestPage =

        guestPages.some(path=>{

            return page.includes(

                path.toLowerCase()

            );

        });


    if(

        isGuestPage

    ){

        Guard.requireGuest();

    }

};


/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Guard.auto();

    }

);