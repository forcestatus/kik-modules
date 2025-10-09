// ================================
// inventory.js - Full Interactive with Advanced Search/Sort
// ================================

// This script implements a full bookstore inventory system.
// Features include:
// - Add, edit, remove books
// - Search by ID, Title, Author
// - Sort by any column with ascending/descending toggle
// - Filter by Genre
// - Load from CSV and save to CSV
// - Maintains order via doubly linked list
// - Supports fast lookup using Maps
// - Inline editable table cells
// - Integrate hash map system

// ================================
// ----- Book Class -----
// Represents a single book object with ID, Title, Author, Genre, Availability
// ================================
class Book {
    constructor(id, title, author, genre, availability) {
        this.id = id;             
        this.title = title;       
        this.author = author;     
        this.genre = genre;       
        this.availability = availability; 
    }
}

// ================================
// ----- Node & Doubly Linked List -----
// Doubly linked list maintains insertion order and allows efficient removal
// ================================
class Node {
    constructor(book) {
        this.book = book;
        this.prev = null;
        this.next = null;
    }
}

class BookList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    // Add book to the end of the list
    add(book) {
        const node = new Node(book);
        if (!this.head) {          
            this.head = this.tail = node;
        } else {                   
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
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // Convert linked list to array for easy display/sorting/filtering
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

// ================================
// ----- Initialize Storage -----
// bookList: linked list for order
// bookMap: fast lookup by ID
// bookMapByTitle / bookMapByAuthor: fast lookup for search
// ================================

// ----- Initialize Data Structures -----
// The linked list keeps book order (for easy iteration and removal)
// Hash maps (using JS Map) allow instant lookups by ID, Title, and Author
const bookList = new BookList();

// Hash Maps for quick access
const bookMap = new Map();          // Lookup by Book ID
const bookMapByTitle = new Map();   // Lookup by Book Title
const bookMapByAuthor = new Map();  // Lookup by Author Name

// ----- Hash Map Utility Functions -----
// These keep all hash maps updated whenever books are added or changed

// Adds book to the title and author maps
function addToSecondaryMaps(book) {
    // For Title
    if (!bookMapByTitle.has(book.title)) bookMapByTitle.set(book.title, []);
    bookMapByTitle.get(book.title).push(book);

    // For Author
    if (!bookMapByAuthor.has(book.author)) bookMapByAuthor.set(book.author, []);
    bookMapByAuthor.get(book.author).push(book);
}

// Rebuilds all secondary maps (used after edits/removals)
function rebuildSecondaryMaps() {
    bookMapByTitle.clear();
    bookMapByAuthor.clear();
    bookList.listBooks().forEach(book => addToSecondaryMaps(book));
}

// Explanation:
// - bookMap.get("123") → retrieves a book instantly by ID
// - bookMapByTitle.get("Dune") → returns an array of all books titled "Dune"
// - bookMapByAuthor.get("Frank Herbert") → returns an array of all books by that author
// - Every time you add, edit, or remove a book, these maps stay in sync.
// - That means you can instantly search later using bookMap.get(id) or bookMapByTitle.get(title).

// ================================
// ----- Current Sort Tracker -----
// Stores current sorted column and direction
// ================================
let currentSort = {
    column: '',
    ascending: true
};

// ================================
// ----- Add Book Manually -----
// Reads input fields, validates, adds to list and maps, refreshes UI
// ================================
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

    if (bookMap.has(id)) { 
        alert("Book ID already exists!");
        return;
    }

    //This ensures every time you add a book, all three maps are updated automatically.
    const book = new Book(id, title, author, genre, availability);
    bookList.add(book);              // Add to linked list
    bookMap.set(id, book);           // Add to hash map for ID
    addToSecondaryMaps(book);        // Add to title/author maps


    updateGenreFilter();     
    displayBooks();          
    clearInputs();           
}

// ================================
// ----- Add to Secondary Maps -----
// Keeps title/author hash maps up to date
// Supports multiple books with same title/author
// ================================
function addToSecondaryMaps(book) {
    if (!bookMapByTitle.has(book.title)) bookMapByTitle.set(book.title, []);
    bookMapByTitle.get(book.title).push(book);

    if (!bookMapByAuthor.has(book.author)) bookMapByAuthor.set(book.author, []);
    bookMapByAuthor.get(book.author).push(book);
}

// ================================
// ----- Display Books -----
// Populates HTML table with current book list
// ================================
function displayBooks(books = bookList.listBooks()) {
    const tbody = document.getElementById("booksTableBody");
    tbody.innerHTML = "";

    books.forEach(book => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-column="id">${book.id}</td>
            <td data-column="title" contenteditable="true" onblur="editBook('${book.id}','title',this.textContent)">${book.title}</td>
            <td data-column="author" contenteditable="true" onblur="editBook('${book.id}','author',this.textContent)">${book.author}</td>
            <td data-column="genre" contenteditable="true" onblur="editBook('${book.id}','genre',this.textContent)">${book.genre}</td>
            <td data-column="availability" contenteditable="true" onblur="editBook('${book.id}','availability',this.textContent)">${book.availability}</td>
            <td><button onclick="removeBook('${book.id}')">Remove</button></td>
        `;
        tbody.appendChild(tr);
    });

    updateSortArrows();
}

// ================================
// ----- Edit Book Inline -----
// Updates book object and rebuilds secondary maps if needed
// ================================
function editBook(id, key, newValue) {
    const book = bookMap.get(id);
    if (!book) return; 
    book[key] = newValue.trim();
    if (key === "genre") updateGenreFilter();
    if (key === "title" || key === "author") rebuildSecondaryMaps();
}

// ================================
// ----- Rebuild Secondary Maps -----
// Clears and repopulates title/author maps after edits
// ================================
function rebuildSecondaryMaps() {
    bookMapByTitle.clear();
    bookMapByAuthor.clear();
    bookList.listBooks().forEach(book => addToSecondaryMaps(book));
}

// ================================
// ----- Remove Book -----
// Confirms removal, deletes from linked list and maps, refreshes UI
// ================================
function removeBook(id) {
    const confirmed = confirm(`Are you sure you want to remove Book ID: ${id}?`);
    if (!confirmed) return;

    const removed = bookList.removeById(id); 
    // Hook maps into removeBook() This ensures everything stays consistent when deleting.
    if (removed) {
        bookMap.delete(id);        // Remove from ID map
        rebuildSecondaryMaps();    // Rebuild title/author maps
        displayBooks();            // Refresh UI
        updateGenreFilter();       // Update genre dropdown
        alert(`Book ID ${id} removed successfully.`);
    }
}

// ================================
// ----- Search Functions -----
// Search by ID, Title, or Author
// ================================
function searchBookById() {
    const searchId = document.getElementById("searchId").value.trim();
    const book = bookMap.get(searchId);
    const result = document.getElementById("searchResult");
    result.textContent = book
        ? `ID: ${book.id}, Title: ${book.title}, Author: ${book.author}, Genre: ${book.genre}, Availability: ${book.availability}`
        : "Book not found.";
}

function searchBookByTitle() {
    const searchTitle = document.getElementById("searchTitle").value.trim();
    const books = bookMapByTitle.get(searchTitle) || [];
    displayBooks(books);
}

function searchBookByAuthor() {
    const searchAuthor = document.getElementById("searchAuthor").value.trim();
    const books = bookMapByAuthor.get(searchAuthor) || [];
    displayBooks(books);
}

// ================================
// ----- Sort Books -----
// Sorts the linked list array by column, toggles ascending/descending
// ================================
function sortBooks(key) {
    const booksArray = bookList.listBooks(); 

    if (currentSort.column === key) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = key;
        currentSort.ascending = true;
    }

    booksArray.sort((a, b) => {
        const valA = a[key] || '';
        const valB = b[key] || '';
        if (!isNaN(valA) && !isNaN(valB)) return currentSort.ascending ? valA - valB : valB - valA;
        return currentSort.ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    displayBooks(booksArray);
}

// ================================
// ----- Update Sort Arrows -----
// Displays ▲ / ▼ in <th> for sorted column
// ================================
function updateSortArrows() {
    const headers = document.querySelectorAll('#booksTable th');
    headers.forEach(th => {
        const arrowSpan = th.querySelector('.arrow');
        if (!arrowSpan) return;
        const col = th.dataset.column;
        arrowSpan.textContent = (col === currentSort.column)
            ? (currentSort.ascending ? '▲' : '▼')
            : '';
    });
}

// ================================
// ----- Filter by Genre -----
// Filters the book table based on selected genre
// ================================
function filterByGenre() {
    const genre = document.getElementById("genreFilter").value;
    const allBooks = bookList.listBooks();
    const filtered = genre ? allBooks.filter(b => b.genre === genre) : allBooks;
    displayBooks(filtered);
}

// ================================
// ----- Update Genre Dropdown -----
// Populates the genre <select> dynamically based on current books
// ================================
function updateGenreFilter() {
    const genreSelect = document.getElementById("genreFilter");
    const genres = [...new Set(bookList.listBooks().map(b => b.genre).filter(g => g))];
    genreSelect.innerHTML = '<option value="">All Genres</option>';
    genres.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        genreSelect.appendChild(opt);
    });
}

// ================================
// ----- CSV Functions -----
// Load books from CSV file and parse into linked list and maps
// ================================
function loadCSV() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
    if (!file) { alert("Please select a CSV file!"); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        parseCSV(e.target.result);
        updateGenreFilter();
        displayBooks();
    };
    reader.readAsText(file); 
}

// ============================
// Function: parseCSV()
// ----------------------------
// Reads the CSV text, skips the header,
// creates Book objects, and adds them
// to both bookList and bookMap.
// ============================
function parseCSV(csvText) {
    const lines = csvText.split("\n"); // Split file into lines

    // const book = new Book(id, title, author, genre, availability);

    // ✅ Start reading from the 2nd line (skip header)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip blank lines

        // ✅ Extract data fields safely
        const [id, title, author = "", genre = "", availability = ""] =
            line.split(",").map(c => c.trim());

        // ✅ Skip invalid or duplicate IDs
        if (!id || !title || bookMap.has(id)) continue;

        // ✅ Create the Book now that we have data
        const book = new Book(id, title, author, genre, availability);

        // ✅ Add to your main structures
        bookList.add(book);      // If bookList is a custom collection class
        bookMap.set(id, book);   // Quick ID lookup

        // ✅ Update any secondary lookup maps if you use them
        addToSecondaryMaps(book);
    }
}


// ----- Quick Search Examples -----
// These will become interactive buttons in a later stage

function searchBookById() {
    const searchId = document.getElementById("searchId").value.trim();
    const book = bookMap.get(searchId);
    const result = document.getElementById("searchResult");

    result.textContent = book
        ? `Found: ${book.title} by ${book.author} (${book.genre})`
        : "Book not found.";
}

function searchBookByTitle() {
    const title = prompt("Enter title:");
    const books = bookMapByTitle.get(title) || [];
    alert(books.length ? `Found ${books.length} match(es).` : "No matches.");
}


// ================================
// ----- Clear Form Inputs -----
// Resets all input fields to default
// ================================
function clearInputs() {
    document.getElementById("bookId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("availability").value = "In Stock"; 
}

// ================================
// ----- Save to CSV -----
// Converts current book list to CSV text and triggers download
// ================================
function saveCSV() {
    const books = bookList.listBooks();
    let csvContent = "ID,Title,Author,Genre,Availability\n";
    books.forEach(b => {
        csvContent += `${b.id},${b.title},${b.author},${b.genre},${b.availability}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "books_inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
}
