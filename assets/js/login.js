"use strict";

//Login Page

let loginCountdown = null;
let isSubmitting = false;

document.addEventListener("DOMContentLoaded", initLogin);

function initLogin() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", handleLogin);

}

async function handleLogin(event) {

    event.preventDefault();

    if (isSubmitting) return;

    const form = event.target;

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitButton = document.getElementById("submitButton");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    Auth.hideAlert();

    if (!Auth.validateEmail(email)) {

        Auth.showAlert("Please enter a valid email address.");
       emailInput.focus();

        return;

    }

    if (!Auth.validatePassword(password)) {

        Auth.showAlert("Password must be at least 8 characters.");
        passwordInput.focus();

        return;

    }

    isSubmitting = true;

    Auth.setLoading(submitButton, true);

    try {

        const result = await API.post(
            "/auth/login",
            {
                email,
                password
            }
        );

        if (result.data.user.role !== "user") {

            Auth.showAlert("Please use Madu Login.");
            return;

        }

        Storage.saveToken(result.data.accessToken);
        Storage.saveRefreshToken(result.data.refreshToken);
        Storage.saveUser(result.data.user);

        window.location.href = "/Dashboard/";
        return;

    } catch (error) {

        console.error(error);

        if (error.status === 429) {
            startLoginCountdown(error.retryAfter);
            Auth.showAlert(error.message);
            return;

        }

        Auth.showAlert(error.message);

    } finally {

        isSubmitting = false;

        Auth.setLoading(
            submitButton,
            false
        );

    }

}

//Login Countdown

function startLoginCountdown(seconds) {

    const submitButton =
        document.getElementById("submitButton");

    if (!submitButton) return;

    if (loginCountdown) {
        clearInterval(loginCountdown);
    }

    submitButton.disabled = true;

    const originalHTML =
        submitButton.innerHTML;

    let remaining =
        Number(seconds);

    if (
        Number.isNaN(remaining) ||
        remaining <= 0
    ) {
        remaining = 30;
    }

    submitButton.innerHTML =
        `Try again (${remaining}s)`;

    loginCountdown = setInterval(() => {
        remaining--;

        if (remaining <= 0) {

            clearInterval(loginCountdown);
            loginCountdown = null;
            submitButton.disabled = false;
            submitButton.innerHTML =
                originalHTML;
            return;
        }

        submitButton.innerHTML =
            `Try again (${remaining}s)`;
    }, 1000);
}

//Reset Login State

function resetLoginState() {
    isSubmitting = false;
    const submitButton =
        document.getElementById("submitButton");

    if (!submitButton) return;

    Auth.setLoading(
        submitButton,
        false
    );

}