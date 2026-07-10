"use strict";

Guard.requireAuth();

const Journey = {};

Journey.items = [];

Journey.escapeHTML = function (value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

};

Journey.load = async function () {

    try {

        const response = await API.get("/journey");

        Journey.items = response.data.journey || [];

        Journey.render();

    }

    catch (error) {

        console.error(error);

        Journey.empty();

    }

};

Journey.render = function () {

    const journeyList = document.getElementById("journeyList");

    journeyList.innerHTML = "";

    if (!Journey.items.length) {

        Journey.empty();

        return;

    }

    Journey.items.forEach(item => {

        const title = Journey.escapeHTML(item.title);
        const organization = Journey.escapeHTML(item.organization);
        const date = Journey.escapeHTML(item.date);
        const description = Journey.escapeHTML(item.description);

        journeyList.innerHTML += `

        <article class="journey-card">

            <h2>${title}</h2>

            <p>${organization}</p>

            <p>${date}</p>

            <p>${description}</p>

        </article>

        `;

    });

};

Journey.empty = function () {

    document.getElementById("journeyList").innerHTML = `

        <p>No journey available.</p>

    `;

};

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Journey.load();

    }

);
