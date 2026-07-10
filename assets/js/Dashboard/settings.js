Guard.requireAuth();

const Settings = {};

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("changePasswordBtn")
        .addEventListener("click", () => {

            window.location.href =
                "../../ForgotPassword/";

        });

});