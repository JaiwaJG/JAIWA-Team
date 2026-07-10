"use strict";

Guard.requireAuth();

const AdminBooks = {};

AdminBooks.items = [];
AdminBooks.editId = null;

AdminBooks.escapeHTML = function (value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

};

AdminBooks.getItems = function (response) {

    const payload = response?.data ?? response;
    const books = payload?.books ?? payload?.data?.books ?? [];

    return Array.isArray(books) ? books : [];

};

AdminBooks.getFormBody = function () {

    return {

        title:
            document.getElementById("title").value.trim(),

        description:
            document.getElementById("description").value.trim(),

        author:
            document.getElementById("author").value.trim(),

        category:
            document.getElementById("category").value.trim(),

        language:
            document.getElementById("language").value.trim(),

        coverImage:
            document.getElementById("coverImage").value.trim(),

        pdfFile:
            document.getElementById("pdfFile").value.trim(),

        pages:
            Number(document.getElementById("pages").value)

    };

};

AdminBooks.resetForm = function () {

    document.getElementById("bookForm").reset();

    const submitButton = document.querySelector("#bookForm button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Save Book";
    }

    AdminBooks.editId = null;

};

AdminBooks.load = async function () {

    try {

        const response = await API.get("/madu/books");

        AdminBooks.items = AdminBooks.getItems(response);

        AdminBooks.render();

    }

    catch (error) {

        console.error(error);

    }

};

AdminBooks.render = function () {

    const booksList = document.getElementById("booksList");

    const items = Array.isArray(AdminBooks.items) ? AdminBooks.items : [];

    booksList.innerHTML = "";

    items.forEach(book => {

        const id = AdminBooks.escapeHTML(book.id);
        const title = AdminBooks.escapeHTML(book.title);
        const author = AdminBooks.escapeHTML(book.author);
        const category = AdminBooks.escapeHTML(book.category);
        const language = AdminBooks.escapeHTML(book.language);

        booksList.innerHTML += `

        <article class="book-item" data-id="${id}">

            <h3>${title}</h3>
            <p>${author}</p>
            <p>${category}</p>
            <p>${language}</p>

            <button
                type="button"
                class="edit-book"
                data-id="${id}">

                Edit

            </button>

            <button
                type="button"
                class="delete-book"
                data-id="${id}">

                Delete

            </button>

        </article>

        `;

    });

};

AdminBooks.submit = async function (event) {

    event.preventDefault();

    const body = AdminBooks.getFormBody();

    try {

        if (AdminBooks.editId) {

            await API.patch(`/madu/books/${AdminBooks.editId}`, body);

        } else {

            await API.post("/madu/books", body);

        }

        AdminBooks.resetForm();
        await AdminBooks.load();

    }

    catch (error) {

        console.error(error);

    }

};

AdminBooks.edit = function (id) {

    const item = AdminBooks.items.find(book => book.id === id);

    if (!item) {
        return;
    }

    document.getElementById("title").value = item.title || "";
    document.getElementById("description").value = item.description || "";
    document.getElementById("author").value = item.author || "";
    document.getElementById("category").value = item.category || "";
    document.getElementById("language").value = item.language || "";
    document.getElementById("coverImage").value = item.coverImage || "";
    document.getElementById("pdfFile").value = item.pdfFile || "";
    document.getElementById("pages").value = item.pages || "";

    const submitButton = document.querySelector("#bookForm button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Update Book";
    }

    AdminBooks.editId = item.id;

};

AdminBooks.delete = async function (id) {

    if (!confirm("Delete this book?")) {

        return;

    }

    try {

        await API.delete(`/madu/books/${id}`);

        if (AdminBooks.editId === id) {
            AdminBooks.resetForm();
        }

        await AdminBooks.load();

    }

    catch (error) {

        console.error(error);

    }

};

AdminBooks.bindEvents = function () {

    document
        .getElementById("bookForm")
        .addEventListener(
            "submit",
            AdminBooks.submit
        );

    document
        .getElementById("booksList")
        .addEventListener("click", event => {

            const editButton = event.target.closest(".edit-book");
            const deleteButton = event.target.closest(".delete-book");

            if (editButton) {

                AdminBooks.edit(editButton.dataset.id);
                return;

            }

            if (deleteButton) {

                AdminBooks.delete(deleteButton.dataset.id);

            }

        });

};

document.addEventListener("DOMContentLoaded", () => {

    AdminBooks.load();
    AdminBooks.bindEvents();

});