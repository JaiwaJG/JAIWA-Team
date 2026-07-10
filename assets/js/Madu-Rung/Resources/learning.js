"use strict";

Guard.requireAuth();

const AdminLearning = {};

AdminLearning.items = [];

AdminLearning.load = async function () {

    try {

        const response = await API.get("/madu/learning");

        AdminLearning.items = response.data || [];

        AdminLearning.render();

    }

    catch (error) {

        console.error(error);

    }

};

AdminLearning.render = function () {

    const learningList = document.getElementById("learningList");

    learningList.innerHTML = "";

    AdminLearning.items.forEach(item => {

        learningList.innerHTML += `

            <article class="learning-item" data-id="${item.id}">

                <h3>${item.title}</h3>

                <p>${item.type}</p>

                <p>${item.category}</p>

                <button
                    class="edit-learning"
                    data-id="${item.id}">

                    Edit

                </button>

                <button
                    class="delete-learning"
                    data-id="${item.id}">

                    Delete

                </button>

            </article>

        `;

    });

};

AdminLearning.add = async function (event) {

    event.preventDefault();

    const body = {

        title: document.getElementById("title").value,

        type: document.getElementById("type").value,

        category: document.getElementById("category").value,

        image: document.getElementById("image").value,

        url: document.getElementById("url").value

    };

    await API.post("/admin/learning", body);

    document.getElementById("learningForm").reset();

    AdminLearning.load();

};

AdminLearning.delete = async function (id) {

    if (!confirm("Delete this resource?")) return;

    await API.delete(`/admin/learning/${id}`);

    AdminLearning.load();

};

AdminLearning.bindEvents = function () {

    document
        .getElementById("learningForm")
        .addEventListener("submit", AdminLearning.add);

    document
        .getElementById("learningList")
        .addEventListener("click", event => {

            if (event.target.classList.contains("delete-learning")) {

                AdminLearning.delete(event.target.dataset.id);

            }

        });

};

document.addEventListener("DOMContentLoaded", () => {

    AdminLearning.load();

    AdminLearning.bindEvents();

});