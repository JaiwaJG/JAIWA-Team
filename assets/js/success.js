/* ==========================================================
   JAIWA Team
   File : assets/js/success.js
   Purpose : Success Page
   Version : 2.0.0
========================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    initSuccess();

});

function initSuccess(){

    const continueButton =
        document.getElementById("continueBtn");

    if(!continueButton) return;

    continueButton.addEventListener(

        "click",

        handleContinue

    );

}

function handleContinue(){

    Auth.redirect(

        "../Login/"

    );

}