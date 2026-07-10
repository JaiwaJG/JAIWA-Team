"use strict";

const MaduLogin = {};

MaduLogin.init = function () {

    const form = document.getElementById("maduLoginForm");

    form.addEventListener("submit", MaduLogin.submit);

};

MaduLogin.submit = async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();
    const password =
        document.getElementById("password").value;
    const submitBtn =
        document.getElementById("loginBtn");
    submitBtn.disabled = true;

    submitBtn.textContent = "Jahkring...";

    try {

        const response = await API.post("/auth/madu-login", {
            email,
            password
        });

        const result = response.data; 

        Storage.saveToken(result.accessToken);
        Storage.saveUser(result.user);

        if (result.user.role !== "madu") {

            alert("Only Madu account can access this page.");

            Storage.removeToken();
            Storage.removeUser();

            submitBtn.disabled = false;
            submitBtn.textContent = "Login";

            return;

        }

        console.log("Redirecting...");
        window.location.href = "../Madu-Rung/index.html";

    } catch (error) {

        alert(
            error?.response?.data?.message ||
            "Login failed."
        );

        submitBtn.disabled = false;
        submitBtn.textContent = "Login";

    }

};

document.addEventListener("DOMContentLoaded", () => {

    MaduLogin.init();

});