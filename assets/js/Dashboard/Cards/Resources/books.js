"use strict";

Guard.requireAuth();

const Books = {};

Books.items = [];
Books.filteredItems = [];
Books.searchTerm = "";
Books.categoryFilter = "All";

Books.escapeHTML = function (value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

};

Books.getItems = function (response) {

    const payload = response?.data ?? response;
    const books = payload?.books ?? payload?.data?.books ?? [];

    return Array.isArray(books) ? books : [];

};

Books.load = async function () {

    try {

        const response = await API.get("/books");

        Books.items = Books.getItems(response);
        Books.filteredItems = [...Books.items];
        Books.render();

    }

    catch (error) {

        console.error("Failed to load books:", error);

        Books.empty();

    }

};

Books.applyFilters = function () {

    const sourceItems = Array.isArray(Books.items) ? Books.items : [];
    const search = Books.searchTerm.trim().toLowerCase();

    Books.filteredItems = sourceItems.filter(book => {

        const matchesSearch = !search || [book.title, book.author, book.description, book.category, book.language]
            .join(" ")
            .toLowerCase()
            .includes(search);

        const matchesCategory = Books.categoryFilter === "All" || book.category === Books.categoryFilter;

        return matchesSearch && matchesCategory;

    });

};

Books.render = function () {

    const booksList = document.getElementById("booksList");

    if (!booksList) {
        return;
    }

    Books.applyFilters();

    const items = Array.isArray(Books.filteredItems) ? Books.filteredItems : [];

    booksList.innerHTML = "";

    if (!items.length) {
        Books.empty();
        return;
    }

    items.forEach(book => {

        const title = Books.escapeHTML(book.title);
        const author = Books.escapeHTML(book.author);
        const category = Books.escapeHTML(book.category);
        const language = Books.escapeHTML(book.language);
        const description = Books.escapeHTML(book.description);
        const coverImage = Books.escapeHTML(book.coverImage || "");
        const pdfFile = Books.escapeHTML(book.pdfFile || "");

        booksList.innerHTML += `

            <article class="book-card" data-id="${book.id}">

                <img
                    src="${coverImage}"
                    alt="${title}"
                >

                <h2>${title}</h2>
                <p>${author}</p>
                <p>${category}</p>
                <p>${language}</p>
                <p>${description}</p>

                <div>
                    <a href="${pdfFile}" target="_blank" rel="noopener noreferrer">Read PDF</a>
                    <a href="${pdfFile}" download>Download PDF</a>
                </div>

            </article>

        `;

    });

};

Books.empty = function () {

    document.getElementById("booksList").innerHTML = `
        <p>No books available.</p>
    `;
};

Books.bindEvents = function () {

    const searchInput = document.getElementById("bookSearch");
    const categoryButtons = document.querySelectorAll("[data-category]");

    if (searchInput) {
        searchInput.addEventListener("input", event => {
            Books.searchTerm = event.target.value;
            Books.render();
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            Books.categoryFilter = button.dataset.category;
            Books.render();
        });
    });

};

document.addEventListener(

    "DOMContentLoaded",
    () => {
        Books.bindEvents();
        Books.load();
    }
);