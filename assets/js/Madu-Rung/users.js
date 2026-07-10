"use strict";

Guard.requireAuth();

const AdminUsers = {};

AdminUsers.items = [];

AdminUsers.load = async function () {

    const response = await API.get("/madu/users");

    AdminUsers.items = response.data || [];

    AdminUsers.render();

};

AdminUsers.render = function () {

    const usersList =
        document.getElementById("usersList");

    usersList.innerHTML = "";

    AdminUsers.items.forEach(user => {

        usersList.innerHTML += `

        <article data-id="${user.id}">

            <h3>${user.username}</h3>

            <p>${user.email}</p>

            <p>${user.role}</p>

            <button class="role-btn"
                    data-id="${user.id}">
                Change Role
            </button>

            <button class="delete-btn"
                    data-id="${user.id}">
                Delete
            </button>

        </article>

        `;

    });

};

document.addEventListener("DOMContentLoaded", () => {

    AdminUsers.load();

});