"use strict";

Guard.requireAuth();

const Learning = {};

Learning.items = [];

//Load Learning

Learning.load = async function () {

    try {

        const response = await API.get("/learning");

        Learning.items = response.data || [];

        Learning.render();

    }

    catch (error) {

        console.error(error);

        Learning.empty();

    }

};

//Render

Learning.render = function () {

    const learningList = document.getElementById("learningList");

    learningList.innerHTML = "";

    Learning.items.forEach(item => {

        learningList.innerHTML += `

            <article class="learning-card">

                <img
                    src="${item.image}"
                    alt="${item.title}"
                >

                <h2>${item.title}</h2>

                <p>${item.type}</p>

                <p>${item.category}</p>

                <a
                    href="${item.url}"
                    target="_blank">

                    Open Resource

                </a>

            </article>

        `;

    });

};

//Empty

Learning.empty = function () {

    document.getElementById("learningList").innerHTML = `

        <p>No learning resources available.</p>

    `;

};

//Init

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Learning.load();
    }
);