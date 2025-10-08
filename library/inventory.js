// ----- Book Class -----
// Represents a single book object with properties like ID, title, author, genre, and availability
class Book {
    constructor(id, title, author, genre, availability) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.availability = availability;
    }
}

// ----- Data Storage -----
// bookList: Array storing all books in order of addition (used for display and sorting)
// bookHash: Map for instant lookup by ID (fast access)
const bookList = [];
const bookHash = new Map();

// ----- Add Book Manually -----
// Called when the "Add Book" button is clicked
function addBook() {
    // Get values from input fields
    const id = document.getElementById("bookId").value.trim();
    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const genre = document.getElementById("genre").value.trim();
    const availability = document.getElementById("availability").value.trim();

    // Validation: ID and Title are required
    if (!id || !title) { 
        alert("Book ID and Title are required!"); 
        return; 
    }

    // Prevent duplicate IDs using the hash map
    if (bookHash.has(id)) { 
        alert("Book ID already exists!"); 
        return; 
    }

    // Create new Book object
    const book = new Book(id, title, author, genre, availability);

    // Add book to storage
    bookList.push(book);       // Add to list for display & sorting
    bookHash.set(id, book);    // Add to map for instant lookup

    updateGenreFilter();       // Refresh genre dropdown
    displayBooks();            // Refresh table display
    clearInputs();             // Clear form inputs
}

// ----- Display Books -----
// Updates the HTML table with current books
function displayBooks(books = bookList) {
    const tbody = document.getElementById("booksTableBody");
    tbody.innerHTML = ""; // Clear current table rows

    books.forEach(book => {
        const tr = document.createElement("tr"); // Create a new row
        tr.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.availability}</td>
        `;
        tbody.appendChild(tr); // Add row to table
    });
}

// ----- Search by ID -----
// Instantly looks up a book using its ID
function searchBookById() {
    const searchId = document.getElementById("searchId").value.trim();
    const book = bookHash.get(searchId); // Map lookup is very fast

    const result = document.getElementById("searchResult");
    result.textContent = book 
        ? `ID: ${book.id}, Title: ${book.title}, Author: ${book.author}, Genre: ${book.genre}, Availability: ${book.availability}`
        : "Book not found."; // Ternary operator: sets text based on existence of book
}

// ----- Sort Books -----
// Sorts the bookList array by a given key when table header is clicked
let sortAscending = true; // Keeps track of sorting order
function sortBooks(key) {
    // Use array sort method with comparison function
    bookList.sort((a, b) => {
        if (a[key] < b[key]) return sortAscending ? -1 : 1;
        if (a[key] > b[key]) return sortAscending ? 1 : -1;
        return 0; // equal values
    });
    sortAscending = !sortAscending; // Toggle sort order for next click
    displayBooks();                 // Update table
}

// ----- Filter by Genre -----
// Shows only books of selected genre
function filterByGenre() {
    const genre = document.getElementById("genreFilter").value;
    const filtered = genre ? bookList.filter(b => b.genre === genre) : bookList; // Filter array if genre selected
    displayBooks(filtered); // Show filtered list
}

// ----- Update Genre Dropdown -----
// Dynamically populates the "Filter by Genre" dropdown
function updateGenreFilter() {
    const genreSelect = document.getElementById("genreFilter");

    // Get unique genres from bookList
    const genres = [...new Set(bookList.map(b => b.genre).filter(g => g))]; 
    // Trick: 'new Set' removes duplicates; '.filter(g => g)' ignores empty strings

    // Reset dropdown options
    genreSelect.innerHTML = '<option value="">All Genres</option>';
    genres.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        genreSelect.appendChild(opt); // Add option to dropdown
    });
}

// ----- CSV Loading -----
// Reads CSV file and adds books
function loadCSV() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
    if (!file) { alert("Please select a CSV file!"); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result; // CSV content as string
        parseCSV(text);
        updateGenreFilter(); // Update genres after CSV load
        displayBooks();      // Show loaded books
    };
    reader.readAsText(file); // Asynchronously reads file
}

// ----- Parse CSV Text -----
// Converts CSV string to Book objects
function parseCSV(csvText) {
    const lines = csvText.split("\n"); // Split into rows
    for (let i = 1; i < lines.length; i++) { // Skip header row
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        const [id, title, author = "", genre = "", availability = ""] = line.split(",").map(c => c.trim());
        // Trick: default values prevent undefined if CSV column missing
        if (!id || !title || bookHash.has(id)) continue; // Skip invalid or duplicate entries
        const book = new Book(id, title, author, genre, availability);
        bookList.push(book);
        bookHash.set(id, book);
    }
}

// ----- Clear Form Inputs -----
function clearInputs() {
    document.getElementById("bookId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("availability").value = "In Stock"; // Reset dropdown to default
}
