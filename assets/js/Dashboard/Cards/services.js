"use strict";

Guard.requireAuth();
const Services = {};
Services.items = [];
Services.escapeHTML = function (value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

Services.formatDate = function (value) {

    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toISOString().slice(0, 10);

};

Services.showState = function (message) {

    const vpnList = document.getElementById("vpnList");

    vpnList.innerHTML = `

        <p class="services-state">${Services.escapeHTML(message)}</p>

    `;

};

Services.loadServers = async function () {

    Services.showState("Loading services...");

    try {

        const response = await API.get("/services");
        Services.items = response.data.services || [];
        Services.renderServers();
        Services.bindCopyButtons();

    }

    catch (error) {

        console.error(error);
        Services.showState(
            error.message || "Unable to load services."
        );

    }

};

Services.renderServers = function () {

    const vpnList = document.getElementById("vpnList");
    vpnList.innerHTML = "";

    if (!Services.items.length) {

        Services.showState("No services available.");

        return;

    }

    Services.items.forEach(server => {

        const id = Services.escapeHTML(server.id);
        const country = Services.escapeHTML(server.country || "");
        const name = Services.escapeHTML(server.serverName || "-");
        const status = Services.escapeHTML(server.status || "-");
        const traffic = Services.escapeHTML(server.traffic || "-");
        const expire = Services.escapeHTML(
            Services.formatDate(server.expire)
        );
        const users = Services.escapeHTML(server.users ?? "-");
        const accessKey = Services.escapeHTML(server.accessKey || "");

        vpnList.innerHTML += `

            <article class="vpn-card" data-id="${id}">

                <h2>${country} ${name}</h2>
                <p><strong>Status :</strong> ${status}</p>
                <p><strong>Traffic :</strong> ${traffic}</p>
                <p><strong>Expire :</strong> ${expire}</p>
                <p><strong>Masha :</strong> ${users}</p>
                <input
                    type="password"
                    readonly
                    class="vpn-key"
                    value="${accessKey}"
                >

                <button
                    class="copy-btn"
                    data-key="${accessKey}">
                    Copy Access Key
                </button>

            </article>

        `;

    });

};

Services.copyKey = async function (key, button) {

    try {

        await navigator.clipboard.writeText(key);
        const oldText = button.textContent;
        button.textContent = "Copied ♦";
        button.disabled = true;
        setTimeout(() => {
            button.textContent = oldText;
            button.disabled = false;
        },300);

    }

    catch (error) {

        console.error(error);
        alert("Copy failed.");

    }

};


Services.bindCopyButtons = function () {

    const buttons = document.querySelectorAll(".copy-btn");
    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const key = button.dataset.key;
            Services.copyKey(key, button);

        });

    });

};


document.addEventListener("DOMContentLoaded", () => {

    Services.loadServers();

});
