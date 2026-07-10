"use strict";

//Madu Dashboard

console.log("Madu-Rung Loaded");

document.addEventListener(
    "DOMContentLoaded",
    initMaduDashboard
);

//Initialize

async function initMaduDashboard() {

    const authorized =
        await verifySession();

    if (!authorized) return;

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }

}

//Verify Session

async function verifySession() {

    const token =
        Storage.getToken();

    if (!token) {

        redirectToMaduLogin();

        return false;

    }

    try {

        const response = await API.getMe();

        //chyam 
        console.log("GET ME =", response);
        if (!response.success) {

            throw new Error(
                "Unauthorized"
            );

        }

        const user =
            response.user;

        if (user.role !== "madu") {

            redirectToMaduLogin();

            return false;

        }

        Storage.saveUser(user);

        return true;

    }

    catch (error) {

        console.error(error);

        redirectToMaduLogin();

        return false;

    }

}

//Logout

async function logout() {

    try {

        await API.post(
            "/auth/logout",
            {
                refreshToken: Storage.getRefreshToken()
            }
        );

    }

    catch (error) {

        console.error(error);

    }

    redirectToMaduLogin();

}

//Redirect

function redirectToMaduLogin() {

    Storage.removeToken();

    Storage.removeRefreshToken();

    Storage.removeUser();

    window.location.replace(
        "/Madu-Login/"
    );

}