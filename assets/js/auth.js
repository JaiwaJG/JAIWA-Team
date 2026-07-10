/* ==========================================================
   JAIWA Team
   File : assets/js/auth.js
   Purpose : Shared Authentication Library
   Version : 2.0.0
========================================================== */

"use strict";

/* ==========================================================
   Namespace
========================================================== */

const Auth = {};


/* ==========================================================
   Config
========================================================== */

Auth.config = {

    redirectDelay: 1500,

    toastDuration: 3000,

    minimumPasswordLength: 8

};


/* ==========================================================
   DOM Helpers
========================================================== */

Auth.qs = function(selector){

    return document.querySelector(selector);

};

Auth.qsa = function(selector){

    return document.querySelectorAll(selector);

};


/* ==========================================================
   Validation
========================================================== */

Auth.validateEmail = function(email){

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

};


Auth.validatePassword = function(password){

    return password.length >=
        Auth.config.minimumPasswordLength;

};


Auth.validateConfirmPassword = function(

    password,

    confirmPassword

){

    return password === confirmPassword;

};


/* ==========================================================
   Redirect
========================================================== */

Auth.redirect = function(url){

    window.location.href = url;

};


/* ==========================================================
   Sleep
========================================================== */

Auth.sleep = function(milliseconds){

    return new Promise(resolve=>{

        setTimeout(resolve,milliseconds);

    });

};

/* ==========================================================
   Alert
========================================================== */

Auth.showAlert = function(message,type="error"){

    const form = document.querySelector(".auth-form");

    if(!form) return;

    let alert = form.querySelector(".auth-alert");

    if(!alert){

        alert = document.createElement("div");

        alert.className = "auth-alert";

        form.prepend(alert);

    }

    alert.textContent = message;

    alert.className = `auth-alert ${type} show`;

};


Auth.hideAlert = function(){

    const alert = document.querySelector(".auth-alert");

    if(alert){

        alert.classList.remove("show");

    }

};



/* ==========================================================
   Loading Button
========================================================== */

Auth.setLoading = function(button,isLoading){

    if(!button) return;

    if(isLoading){

        button.disabled = true;

        button.dataset.originalText =
            button.textContent;

        button.textContent = "Please wait...";

        button.classList.add("loading");

    }else{

        button.disabled = false;

        button.textContent =
            button.dataset.originalText ||
            "Submit";

        button.classList.remove("loading");

    }

};



/* ==========================================================
   Toast
========================================================== */

Auth.showToast = function(

    message,

    type="success"

){

    let toast =
        document.querySelector(".auth-toast");

    if(!toast){

        toast =
            document.createElement("div");

        toast.className = "auth-toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.className =
        `auth-toast ${type} show`;

    setTimeout(()=>{

        toast.classList.remove("show");

    },Auth.config.toastDuration);

};

/* ==========================================================
   Password Toggle
========================================================== */

Auth.initPasswordToggle = function(){

    const toggleButtons =
        Auth.qsa(".password-toggle");

    toggleButtons.forEach(button=>{

        button.addEventListener("click",()=>{

            const input =
                button.previousElementSibling;

            const icon =
                button.querySelector("svg");

            if(input.type==="password"){

                input.type="text";

                if(icon){

                    icon.innerHTML=`
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M1 1l22 22"/>
                    `;

                }

            }else{

                input.type="password";

                if(icon){

                    icon.innerHTML=`
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12"
                                cy="12"
                                r="3"/>
                    `;

                }

            }

        });

    });

};



/* ==========================================================
   Password Strength
========================================================== */

Auth.initPasswordStrength = function(){

    const passwordInput =
        Auth.qs("#password");

    if(!passwordInput) return;

    const bars =
        Auth.qsa(".strength-bar");

    passwordInput.addEventListener("input",()=>{

        const password =
            passwordInput.value;

        let level=0;

        if(password.length>=8) level++;
        if(/[A-Z]/.test(password)) level++;
        if(/[0-9]/.test(password)) level++;
        if(/[^A-Za-z0-9]/.test(password)) level++;

        bars.forEach((bar,index)=>{

            bar.classList.toggle(

                "active",

                index<level

            );

        });

    });

};



/* ==========================================================
   Local Storage
========================================================== */

Auth.saveLocal = function(key,value){

    localStorage.setItem(

        key,

        JSON.stringify(value)

    );

};


Auth.getLocal = function(key){

    const value =
        localStorage.getItem(key);

    return value
        ? JSON.parse(value)
        : null;

};


Auth.removeLocal = function(key){

    localStorage.removeItem(key);

};



/* ==========================================================
   Session Storage
========================================================== */

Auth.saveSession = function(key,value){

    sessionStorage.setItem(

        key,

        JSON.stringify(value)

    );

};


Auth.getSession = function(key){

    const value =
        sessionStorage.getItem(key);

    return value
        ? JSON.parse(value)
        : null;

};


Auth.removeSession = function(key){

    sessionStorage.removeItem(key);

};

/* ==========================================================
   API
========================================================== */

Auth.api = async function(

    url,

    options = {}

){

    const baseUrl = (typeof CONFIG !== "undefined" && CONFIG.API_URL)
        ? CONFIG.API_URL
        : "http://localhost:5000/api";

    const apiUrl = url.startsWith("http")
        ? url
        : `${baseUrl}${url}`;

    const config = {

        headers:{

            "Content-Type":"application/json"

        },

        ...options

    };

    const response = await fetch(

        apiUrl,

        config

    );

    let data = null;

    try{

        data = await response.json();

    }
    catch{

        data = null;

    }

    if(!response.ok){

        throw new Error(

            (data && data.message) || "Request failed."

        );

    }

    return data;

};



/* ==========================================================
   Debounce
========================================================== */

Auth.debounce = function(

    callback,

    delay = 300

){

    let timeout;

    return (...args)=>{

        clearTimeout(timeout);

        timeout = setTimeout(()=>{

            callback(...args);

        },delay);

    };

};



/* ==========================================================
   Throttle
========================================================== */

Auth.throttle = function(

    callback,

    delay = 300

){

    let waiting = false;

    return (...args)=>{

        if(waiting) return;

        callback(...args);

        waiting = true;

        setTimeout(()=>{

            waiting = false;

        },delay);

    };

};



/* ==========================================================
   Reset Form
========================================================== */

Auth.resetForm = function(form){

    if(form){

        form.reset();

    }

};



/* ==========================================================
   Initialize
========================================================== */

Auth.init = function(){

    Auth.initPasswordToggle();

    Auth.initPasswordStrength();

};



/* ==========================================================
   Auto Initialize
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Auth.init();

    }

);