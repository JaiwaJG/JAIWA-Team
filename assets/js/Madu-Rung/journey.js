"use strict";

Guard.requireAuth();

if (!API.patch) {

    API.patch = function (
        endpoint,
        body = {}
    ) {

        return API.request(endpoint, {
            method: "PATCH",
            body: JSON.stringify(body)
        });

    };

}

const AdminJourney = {};

AdminJourney.items = [];
AdminJourney.editId = null;

AdminJourney.escapeHTML = function (value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

};

AdminJourney.getFormBody = function () {

    return {

        title:
            document.getElementById("title").value.trim(),

        organization:
            document.getElementById("organization").value.trim(),

        date:
            document.getElementById("date").value.trim(),

        description:
            document.getElementById("description").value.trim()

    };

};

AdminJourney.resetForm = function () {

    document.getElementById("journeyForm").reset();

    const submitButton = document.querySelector("#journeyForm button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Save Journey";
    }

    AdminJourney.editId = null;

};

AdminJourney.load = async function () {

    try {

        const response = await API.get("/madu/journey");

        AdminJourney.items = response.data.journey || [];

        AdminJourney.render();

    }

    catch (error) {

        console.error(error);

    }

};

AdminJourney.render = function () {

    const journeyList = document.getElementById("journeyList");

    journeyList.innerHTML = "";

    AdminJourney.items.forEach(item => {

        const id = AdminJourney.escapeHTML(item.id);
        const title = AdminJourney.escapeHTML(item.title);
        const organization = AdminJourney.escapeHTML(item.organization);
        const date = AdminJourney.escapeHTML(item.date);
        const description = AdminJourney.escapeHTML(item.description);

        journeyList.innerHTML += `

        <article
            class="journey-item"
            data-id="${id}">

            <h3>${title}</h3>

            <p>${organization}</p>

            <p>${date}</p>

            <p>${description}</p>

            <button
                type="button"
                class="edit-journey"
                data-id="${id}">

                Edit

            </button>

            <button
                type="button"
                class="delete-journey"
                data-id="${id}">

                Delete

            </button>

        </article>`;

    });

};

AdminJourney.submit = async function (event) {

    event.preventDefault();

    const body = AdminJourney.getFormBody();

    try {

        if (AdminJourney.editId) {

            await API.patch(
                `/madu/journey/${AdminJourney.editId}`,
                body
            );

        } else {

            await API.post("/madu/journey", body);

        }

        AdminJourney.resetForm();

        await AdminJourney.load();

    }

    catch (error) {

        console.error(error);

    }

};

AdminJourney.edit = function (id) {

    const item = AdminJourney.items.find(
        journey => journey.id === id
    );

    if (!item) {
        return;
    }

    document.getElementById("title").value =
        item.title || "";

    document.getElementById("organization").value =
        item.organization || "";

    document.getElementById("date").value =
        item.date || "";

    document.getElementById("description").value =
        item.description || "";

    const submitButton = document.querySelector("#journeyForm button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Update Journey";
    }

    AdminJourney.editId = item.id;

};

AdminJourney.delete = async function (id) {

    if (!confirm("Delete this journey?")) {

        return;

    }

    try {

        await API.delete(`/madu/journey/${id}`);

        if (AdminJourney.editId === id) {
            AdminJourney.resetForm();
        }

        await AdminJourney.load();

    }

    catch (error) {

        console.error(error);

    }

};

AdminJourney.bindEvents = function () {

    document
        .getElementById("journeyForm")
        .addEventListener(
            "submit",
            AdminJourney.submit
        );

    document
        .getElementById("journeyList")
        .addEventListener(
            "click",
            event => {

                const editButton =
                    event.target.closest(".edit-journey");

                const deleteButton =
                    event.target.closest(".delete-journey");

                if (editButton) {

                    AdminJourney.edit(
                        editButton.dataset.id
                    );

                    return;

                }

                if (deleteButton) {

                    AdminJourney.delete(
                        deleteButton.dataset.id
                    );

                }

            }
        );

};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AdminJourney.load();
        AdminJourney.bindEvents();

    }
);
