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

const AdminServices = {};

AdminServices.items = [];
AdminServices.editId = null;

AdminServices.escapeHTML = function (value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

};

AdminServices.formatDate = function (value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }

    return date.toISOString().slice(0, 10);

};

AdminServices.getFormBody = function () {

    return {

        serverName:
            document.getElementById("serverName").value.trim(),

        country:
            document.getElementById("country").value.trim(),

        status:
            document.getElementById("status").value.trim(),

        traffic:
            document.getElementById("traffic").value.trim(),

        expire:
            document.getElementById("expire").value,

        accessKey:
            document.getElementById("accessKey").value.trim()

    };

    //ISO format

    body.expire = new Date(body.expire).toISOString();
    return body;
};

AdminServices.resetForm = function () {

    document.getElementById("serviceForm").reset();

    AdminServices.editId = null;

};

AdminServices.load = async function () {

    try {

        const response = await API.get("/madu/services");

        AdminServices.items = response.data.services || [];

        AdminServices.render();

    }

    catch (error) {

        console.error(error);

    }

};

AdminServices.render = function () {

    const servicesList = document.getElementById("servicesList");

    servicesList.innerHTML = "";

    AdminServices.items.forEach(service => {

        const id = AdminServices.escapeHTML(service.id);
        const serverName = AdminServices.escapeHTML(service.serverName);
        const country = AdminServices.escapeHTML(service.country);
        const status = AdminServices.escapeHTML(service.status);
        const traffic = AdminServices.escapeHTML(service.traffic);
        const expire = AdminServices.escapeHTML(
            AdminServices.formatDate(service.expire)
        );

        servicesList.innerHTML += `

        <article
            class="service-item"
            data-id="${id}">

            <h3>${serverName}</h3>

            <p>${country}</p>

            <p>${status}</p>

            <p>${traffic}</p>

            <p>${expire}</p>

            <button
                type="button"
                class="edit-service"
                data-id="${id}">

                Edit

            </button>

            <button
                type="button"
                class="delete-service"
                data-id="${id}">
                Delete
            </button>

        </article>`;

    });

};

AdminServices.submit = async function (event) {

    event.preventDefault();

    const body = AdminServices.getFormBody();

    try {

        if (AdminServices.editId) {

            await API.patch(
                `/madu/services/${AdminServices.editId}`,
                body
            );

            AdminServices.editId = null;

        } else {

            await API.post("/madu/services", body);

        }

        AdminServices.resetForm();

        await AdminServices.load();

    }

    catch (error) {

        console.error(error);

    }

};

AdminServices.edit = function (id) {

    const service = AdminServices.items.find(
        item => item.id === id
    );

    if (!service) {
        return;
    }

    document.getElementById("serverName").value =
        service.serverName || "";

    document.getElementById("country").value =
        service.country || "";

    document.getElementById("status").value =
        service.status || "";

    document.getElementById("traffic").value =
        service.traffic || "";

    document.getElementById("expire").value =
        AdminServices.formatDate(service.expire);

    document.getElementById("accessKey").value =
        service.accessKey || "";

    AdminServices.editId = service.id;

};

AdminServices.delete = async function (id) {

    if (!confirm("Delete this server?")) {

        return;

    }

    try {

        await API.delete(`/madu/services/${id}`);

        if (AdminServices.editId === id) {
            AdminServices.resetForm();
        }

        await AdminServices.load();

    }

    catch (error) {

        console.error(error);

    }

};

AdminServices.bindEvents = function () {

    document
        .getElementById("serviceForm")
        .addEventListener(
            "submit",
            AdminServices.submit
        );

    document
        .getElementById("servicesList")
        .addEventListener(
            "click",
            event => {

                const editButton =
                    event.target.closest(".edit-service");

                const deleteButton =
                    event.target.closest(".delete-service");

                if (editButton) {

                    AdminServices.edit(
                        editButton.dataset.id
                    );

                    return;

                }

                if (deleteButton) {

                    AdminServices.delete(
                        deleteButton.dataset.id
                    );

                }

            }
        );

};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AdminServices.load();
        AdminServices.bindEvents();

    }
);
