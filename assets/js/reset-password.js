/* ==========================================================
   JAIWA Team
   File : assets/js/reset-password.js
   Purpose : Reset Password
   Version : 2.0.0
========================================================== */

"use strict";


document.addEventListener("DOMContentLoaded", () => {
    initResetPassword();
});


function initResetPassword(){
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    if(!resetPasswordForm) return;

    resetPasswordForm.addEventListener("submit", handleResetPassword);
}


async function handleResetPassword(event){
    event.preventDefault();

    const form = event.target;
    const emailInput = document.getElementById("email");
    const codeInput = document.getElementById("code");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const submitButton = form.querySelector(".btn-submit");

    const email = emailInput ? emailInput.value.trim() : "";
    const code = codeInput ? codeInput.value.trim().toUpperCase() : "";
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    Auth.hideAlert();

    if(!Auth.validateEmail(email)){
        Auth.showAlert("Please enter a valid email address.");
        if(emailInput) emailInput.focus();
        return;
    }

    if(code.length !== 8){
        Auth.showAlert("Please enter the 8-character reset code.");
        if(codeInput) codeInput.focus();
        return;
    }

    if(!Auth.validatePassword(password)){
        Auth.showAlert("Password must be at least 8 characters.");
        passwordInput.focus();
        return;
    }

    if(!Auth.validateConfirmPassword(password, confirmPassword)){
        Auth.showAlert("Passwords do not match.");
        confirmPasswordInput.focus();
        return;
    }

    Auth.setLoading(submitButton, true);

    try{
        await Auth.api("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ email, code, newPassword: password })
        });

        Auth.showToast("Password updated successfully.");
        Auth.redirect("../Success/");
    }
    catch(error){
        Auth.showAlert(error.message || "Unable to reset password.");
    }
    finally{
        Auth.setLoading(submitButton, false);
    }
}
