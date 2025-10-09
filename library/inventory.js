// ================================
// inventory.js - Full Interactive
// ================================

// ----- Book Class -----
// Represents a single book object
class Book {
    constructor(id, title, author, genre, availability) {
        this.id = id;             // Unique book ID
        this.title = title;       // Book title
        this.author = author;     // Author name
        this.genre = genre;       // Book genre
        this.availability = availability; // Availability status
    }
}

// ----- Node & Linked List Classes -----
// Node stores a book and links to previous/next nodes
class Node {
    constructor(book) {
        this.book = book;   // Actual book object
        this.prev = null;   // Pointer to previous node
        this.next = null;   // Pointer to next node
    }
}

// Doubly linked list to maintain book order
class BookList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    // Add book to end of list
    add(book) {
        const node = new Node(book);
        if (!this.head) {          // If list empty
            this.head = this.tail = node;
        } else {                   // Append at tail
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
        }
    }

    // Remove book by ID
    removeById(id) {
        let current = this.head;
        while (current) {
            if (current.book.id === id) {
                if (current.prev) current.prev.next = current.next;
                if (current.next) current.next.prev = current.prev;
                if (current === this.head) this.head = current.next;
                if (current === this.tail) this.tail = current.prev;
                return true; // Successfully removed
            }
            current = current.next;
        }
        return false; // Not found
    }

    // Convert linked list to array (needed for display, sort, filter)
    listBooks() {
        const books = [];
        let current = this.head;
        while (current) {
            books.push(current.book);
            current = current.next;
        }
        return books;
    }
}

// ----- Initialize storage -----
// Linked list maintains order, hash map allows instant lookup
const bookList = new BookList();
const bookMap = new Map();

// ----- Add Book Manually -----
function addBook() {
    const id = document.getElementById("bookId").value.trim();
    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const genre = document.getElementById("genre").value.trim();
    const availability = document.getElementById("availability").value.trim();

    if (!id || !title) {
        alert("Book ID and Title are required!");
        return;
    }

    if (bookMap.has(id)) { // Prevent duplicates using hash map
        alert("Book ID already exists!");
        return;
    }

    const book = new Book(id, title, author, genre, availability);
    bookList.add(book);      // Add to linked list
    bookMap.set(id, book);   // Add to hash map

    updateGenreFilter();     // Refresh genre dropdown
    displayBooks();          // Refresh table display
    clearInputs();           // Reset form fields
}

// ----- Display Books -----
// Builds table rows, includes Remove button & inline editable fields
function displayBooks(books = bookList.listBooks()) {
    const tbody = document.getElementById("booksTableBody");
    tbody.innerHTML = ""; // Clear existing table rows

    books.forEach(book => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${book.id}</td>
            <td contenteditable="true" onblur="editBook('${book.id}', 'title', this.textContent)">${book.title}</td>
            <td contenteditable="true" onblur="editBook('${book.id}', 'author', this.textContent)">${book.author}</td>
            <td contenteditable="true" onblur="editBook('${book.id}', 'genre', this.textContent)">${book.genre}</td>
            <td contenteditable="true" onblur="editBook('${book.id}', 'availability', this.textContent)">${book.availability}</td>
            <td><button onclick="removeBook('${book.id}')">Remove</button></td>
        `;

        tbody.appendChild(tr);
    });
}

// ----- Edit Book Inline -----
// Updates the book object when user edits table cell
function editBook(id, key, newValue) {
    const book = bookMap.get(id);
    if (!book) return; // Safety check
    book[key] = newValue.trim(); // Update value in object
    if (key === "genre") updateGenreFilter(); // Refresh genre dropdown if needed
}

// ----- Remove Book -----
// Called when Remove button is clicked
function removeBook(id) {
    const confirmed = confirm(`Are you sure you want to remove Book ID: ${id}?`);
    if (!confirmed) return;

    const removed = bookList.removeById(id); // Remove from linked list
    if (removed) {
        bookMap.delete(id); // Remove from hash map
        displayBooks();     // Refresh table
        updateGenreFilter(); // Refresh dropdown in case genre list changes
        alert(`Book ID ${id} removed successfully.`);
    } else {
        alert("Book not found!");
    }
}

// ----- Search by ID -----
function searchBookById() {
    const searchId = document.getElementById("searchId").value.trim();
    const book = bookMap.get(searchId);

    const result = document.getElementById("searchResult");
    result.textContent = book
        ? `ID: ${book.id}, Title: ${book.title}, Author: ${book.author}, Genre: ${book.genre}, Availability: ${book.availability}`
        : "Book not found.";
}

// ----- Sort Books -----
let sortAscending = true;
function sortBooks(key) {
    const booksArray = bookList.listBooks(); // Convert linked list to array

    booksArray.sort((a, b) => {
        if (a[key] < b[key]) return sortAscending ? -1 : 1;
        if (a[key] > b[key]) return sortAscending ? 1 : -1;
        return 0; // Equal values
    });

    sortAscending = !sortAscending; // Toggle for next click
    displayBooks(booksArray);
}

// ----- Filter by Genre -----
function filterByGenre() {
    const genre = document.getElementById("genreFilter").value;
    const allBooks = bookList.listBooks();
    const filtered = genre ? allBooks.filter(b => b.genre === genre) : allBooks;
    displayBooks(filtered);
}

// ----- Update Genre Dropdown -----
function updateGenreFilter() {
    const genreSelect = document.getElementById("genreFilter");

    const genres = [...new Set(bookList.listBooks().map(b => b.genre).filter(g => g))]; 
    // Trick: 'new Set' removes duplicates; '.filter(g => g)' removes empty strings

    genreSelect.innerHTML = '<option value="">All Genres</option>';
    genres.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        genreSelect.appendChild(opt);
    });
}

// ----- CSV Loading -----
function loadCSV() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
    if (!file) { alert("Please select a CSV file!"); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
        updateGenreFilter();
        displayBooks();
    };
    reader.readAsText(file); // Asynchronously read CSV content
}

// ----- Parse CSV Text -----
function parseCSV(csvText) {
    const lines = csvText.split("\n");
    for (let i = 1; i < lines.length; i++) { // Skip header row
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        const [id, title, author = "", genre = "", availability = ""] = line.split(",").map(c => c.trim());
        // Default values prevent undefined errors if column is missing

        if (!id || !title || bookMap.has(id)) continue; // Skip invalid/duplicate

        const book = new Book(id, title, author, genre, availability);
        bookList.add(book);
        bookMap.set(id, book);
    }
}

// ----- Clear Form Inputs -----
function clearInputs() {
    document.getElementById("bookId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("availability").value = "In Stock"; // Reset dropdown
}
