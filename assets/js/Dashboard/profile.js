Guard.requireAuth();

const Profile = {};

Profile.load = function () {

    const user = Storage.getUser();

    if (!user) return;

    document.getElementById("profileUsername").textContent =
        user.username || "-";

    document.getElementById("profileEmail").textContent =
        user.email || "-";

    document.getElementById("profileRole").textContent =
        user.role || "User";

    document.getElementById("profileCreatedAt").textContent =
        user.createdAt || "-";

};

document.addEventListener("DOMContentLoaded", () => {

    Profile.load();

});