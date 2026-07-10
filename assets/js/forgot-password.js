/* ==========================================================
   JAIWA Team
   File : assets/js/forgot-password.js
   Purpose : Forgot Password
   Version : 2.0.0
========================================================== */

"use strict";


document.addEventListener("DOMContentLoaded", () => {
    initForgotPassword();
});


function initForgotPassword(){
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if(!forgotPasswordForm) return;

    forgotPasswordForm.addEventListener("submit", handleForgotPassword);
}


async function handleForgotPassword(event){
    event.preventDefault();

    const form = event.target;
    const emailInput = document.getElementById("email");
    const submitButton = form.querySelector(".btn-submit");
    const email = emailInput.value.trim();

    Auth.hideAlert();

    if(!Auth.validateEmail(email)){
        Auth.showAlert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    Auth.setLoading(submitButton, true);

    try{
        await Auth.api("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email })
        });

        Auth.showToast("If an account exists, a reset code has been sent.");
        Auth.resetForm(form);
    }
    catch(error){
        Auth.showAlert(error.message || "Unable to send reset code.");
    }
    finally{
        Auth.setLoading(submitButton, false);
    }
}
