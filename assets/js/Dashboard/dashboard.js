console.log("Dashboard Loaded");

"use strict";

/* ==========================================
   Dashboard
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    initDashboard
);

/* ==========================================
   Initialize
========================================== */

async function initDashboard() {

    Guard.requireAuth();

    const authorized =
        await verifySession();

    if (!authorized) return;

    loadUser();

    setupDropdown();

    setupLogout();

}

/* ==========================================
   Verify Session
========================================== */

async function verifySession() {

    try {

        const response =
            await API.getMe();

        if (!response.success) {

            Guard.logout();

            return false;

        }

        const user =
            response.data?.user || response.user;

        if (!user) {

            Guard.logout();

            return false;

        }

        Storage.saveUser(user);

        return true;

    }

    catch (error) {

        console.error(error);

        Guard.logout();

        return false;

    }

}

/* ==========================================
   Load User
========================================== */

function loadUser() {

    const user =
        Storage.getUser();

    if (!user) return;

    const username =
        user.username || "User";

    const email =
        user.email || "";

    const userName =
        document.getElementById("userName");

    const userEmail =
        document.getElementById("userEmail");

    const welcomeUsername =
        document.getElementById("welcomeUsername");

    const avatar =
        document.querySelector(".profile-avatar");

    if (userName)
        userName.textContent = username;

    if (userEmail)
        userEmail.textContent = email;

    if (welcomeUsername)
        welcomeUsername.textContent = username;

    if (avatar)
        avatar.textContent =
            username.charAt(0).toUpperCase();

}

/* ==========================================
   Dropdown
========================================== */

function setupDropdown() {

    const button =
        document.getElementById(
            "profileDropdownBtn"
        );

    const menu =
        document.getElementById(
            "profileDropdownMenu"
        );

    if (!button || !menu) return;

    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            menu.classList.toggle(
                "show"
            );

        }
    );

    document.addEventListener(
        "click",
        function () {

            menu.classList.remove(
                "show"
            );

        }
    );

}

/* ==========================================
   Logout
========================================== */

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );

    if (!logoutBtn) return;

    logoutBtn.addEventListener(
        "click",
        logout
    );

}

async function logout() {

    try {

        await API.post(
            "/auth/logout"
        );

    }

    catch (error) {

        console.error(error);

    }

    Guard.logout();

}