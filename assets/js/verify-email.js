/* ==========================================================
   JAIWA Team
   File : assets/js/verify-email.js
   Purpose : Verify Email Page
   Version : 2.0.0
========================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initVerifyEmail();
});


function initVerifyEmail(){
    const verifyForm = document.getElementById("verifyEmailForm");
    const resendButton = document.getElementById("resendBtn");
    const emailInput = document.getElementById("email");

    const params = new URLSearchParams(window.location.search);
    const prefilledEmail = params.get("email");

    if(emailInput && prefilledEmail){
        emailInput.value = prefilledEmail;
    }

    if(verifyForm){
        verifyForm.addEventListener("submit", handleVerifyEmail);
    }

    if(resendButton){
        resendButton.addEventListener("click", handleResendCode);
    }
}


async function handleVerifyEmail(event){
    event.preventDefault();

    const form = event.target;
    const emailInput = document.getElementById("email");
    const codeInput = document.getElementById("code");
    const submitButton = form.querySelector(".btn-submit");

    const email = emailInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();

    Auth.hideAlert();

    if(!Auth.validateEmail(email)){
        Auth.showAlert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    if(code.length !== 8){
        Auth.showAlert("Please enter the 8-character verification code.");
        codeInput.focus();
        return;
    }

    Auth.setLoading(submitButton, true);

    try{
        await Auth.api("/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ email, code })
        });

        Auth.showToast("Email verified successfully.");
        Auth.redirect("../Login/");
    }
    catch(error){
        Auth.showAlert(error.message || "Invalid or expired verification code.");
    }
    finally{
        Auth.setLoading(submitButton, false);
    }
}


async function handleResendCode(){
    const emailInput = document.getElementById("email");
    const resendButton = document.getElementById("resendBtn");
    const email = emailInput ? emailInput.value.trim() : "";

    if(!Auth.validateEmail(email)){
        Auth.showAlert("Please enter your email address first.");
        if(emailInput) emailInput.focus();
        return;
    }

    Auth.setLoading(resendButton, true);

    try{
        await Auth.api("/auth/resend-verification-code", {
            method: "POST",
            body: JSON.stringify({ email })
        });

        Auth.showToast("Verification code sent.");
    }
    catch(error){
        Auth.showAlert(error.message || "Unable to resend verification code.");
    }
    finally{
        Auth.setLoading(resendButton, false);
    }
}
