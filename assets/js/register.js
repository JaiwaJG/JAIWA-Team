/* ==========================================================
   JAIWA Team
   File : assets/js/register.js
   Purpose : Register Page
   Version : 2.0.0
========================================================== */

"use strict";


document.addEventListener("DOMContentLoaded", () => {
    initRegister();
});


function initRegister(){
    const registerForm = document.getElementById("registerForm");
    if(!registerForm) return;

    registerForm.addEventListener("submit", handleRegister);
}


async function handleRegister(event){
    event.preventDefault();

    const form = event.target;
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const termsCheckbox = document.getElementById("terms");
    const submitButton = form.querySelector(".btn-submit");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : "";

    Auth.hideAlert();

    if(username === ""){
        Auth.showAlert("Please enter a username.");
        if(usernameInput) usernameInput.focus();
        return;
    }

    if(!Auth.validateEmail(email)){
        Auth.showAlert("Please enter a valid email address.");
        emailInput.focus();
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

    if(termsCheckbox && !termsCheckbox.checked){
        Auth.showAlert("Please accept the Terms & Conditions.");
        return;
    }

    Auth.setLoading(submitButton, true);

    try{
        await Auth.api("/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, email, password })
        });

        Auth.showToast("Account created successfully.");
        Auth.redirect(`../VerifyEmail/?email=${encodeURIComponent(email)}`);
    }
    catch(error){
        Auth.showAlert(error.message || "Unable to create your account.");
    }
    finally{
        Auth.setLoading(submitButton, false);
    }
}
