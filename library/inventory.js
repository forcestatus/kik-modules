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
// - Implement a Custom Sorting Algorithm
// - Save Books to LocalStorage, add automatic saving on edits/removals 
// - Open Library button intergration

// ================================
// ----- Book Class -----
// Represents a single book object with ID, Title, Author, Genre, Availability
// ================================
class Book {
    constructor(id, title, author, genre, availability) {
        this.id = id;              // Unique book ID
        this.title = title;        // Book title
        this.author = author;      // Author name
        this.genre = genre;        // Book genre
        this.availability = availability; // In Stock / Out of Stock
    }
}

// ================================
// ----- Node & Doubly Linked List -----
// This allows us to maintain insertion order and efficiently remove books
// ================================
class Node {
    constructor(book) {
        this.book = book;  // Store the book object
        this.prev = null;  // Pointer to previous node
        this.next = null;  // Pointer to next node
    }
}

class BookList {
    constructor() {
        this.head = null; // Start of the list
        this.tail = null; // End of the list
    }

    // Add a book to the end of the list
    add(book) {
        const node = new Node(book);
        if (!this.head) {          
            this.head = this.tail = node; // First node in the list
        } else {                   
            this.tail.next = node;  // Link current tail to new node
            node.prev = this.tail;  // Link new node back to current tail
            this.tail = node;       // Update tail pointer to new node
        }
    }

    // Remove a book by its ID
    removeById(id) {
        let current = this.head;
        while (current) {
            if (current.book.id === id) {
                if (current.prev) current.prev.next = current.next;
                if (current.next) current.next.prev = current.prev;
                if (current === this.head) this.head = current.next; // Update head if removed node was head
                if (current === this.tail) this.tail = current.prev; // Update tail if removed node was tail
                return true; // Book removed
            }
            current = current.next;
        }
        return false; // Book not found
    }

    // Convert linked list to array for easy display/filtering/sorting
    listBooks() {
        const books = [];
        let current = this.head;
        while (current) {
            books.push(current.book);
            current = current.next; // Move to next node
        }
        return books;
    }
}

// ================================
// ----- Initialize Storage -----
// ================================
const bookList = new BookList();       // Linked list keeps order
const bookMap = new Map();             // Quick lookup by ID
const bookMapByTitle = new Map();      // Quick lookup by Title
const bookMapByAuthor = new Map();     // Quick lookup by Author
let currentSort = { column: '', ascending: true }; // Track current sort column
let currentDisplayList = []; // Stores currently displayed books

// ================================
// ----- Hash Map Utilities -----
// Keeps title/author maps in sync
// ================================
function addToSecondaryMaps(book) {
    // For Title: allow multiple books with same title
    if (!bookMapByTitle.has(book.title)) bookMapByTitle.set(book.title, []);
    bookMapByTitle.get(book.title).push(book); // Push book into array at this title

    // For Author: allow multiple books by same author
    if (!bookMapByAuthor.has(book.author)) bookMapByAuthor.set(book.author, []);
    bookMapByAuthor.get(book.author).push(book);
}

// Rebuild secondary maps after edits or removals
function rebuildSecondaryMaps() {
    bookMapByTitle.clear();
    bookMapByAuthor.clear();
    bookList.listBooks().forEach(book => addToSecondaryMaps(book));
}

// ================================
// ----- Add Book -----
// Reads input fields, validates, adds book to list and maps
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

    const book = new Book(id, title, author, genre, availability);
    bookList.add(book);        // Add to linked list
    bookMap.set(id, book);     // Add to ID map
    addToSecondaryMaps(book);  // Add to Title/Author maps

    updateGenreFilter();       // Update dropdown
    displayBooks();            // Refresh table
    saveToLocalStorage();      // Persist changes. Save changes automatically whenever you add, edit, or remove a book.
    clearInputs();             // Clear input fields
}

// ================================
// ----- Save to LocalStorage -----
// Saves current book list so it persists across page reloads
// ================================
function saveToLocalStorage() {
    const books = bookList.listBooks();           // Convert linked list to array
    localStorage.setItem('booksInventory', JSON.stringify(books)); // Store as JSON

}

// ================================
// ----- Load from LocalStorage -----
// Loads saved books when page loads
// ================================
function loadFromLocalStorage() {
    const storedBooks = localStorage.getItem('booksInventory');
    if (!storedBooks) return; // Nothing saved yet

    const booksArray = JSON.parse(storedBooks); // Convert JSON string back to array

    booksArray.forEach(b => {
        // Recreate Book objects and add to list and maps
        const book = new Book(b.id, b.title, b.author, b.genre, b.availability);
        bookList.add(book);          // Add to linked list
        bookMap.set(book.id, book);  // Add to ID map
        addToSecondaryMaps(book);    // Add to Title/Author maps
    });

    updateGenreFilter();       // Refresh genre dropdown
    displayBooks(bookList.listBooks()); // Show books in table
}

// ================================
// ----- Display Books -----
// Populates HTML table with current list
// ================================
function displayBooks(books = bookList.listBooks()) {
    currentDisplayList = books; // Keep track of displayed books
    const tbody = document.getElementById("booksTableBody");
    tbody.innerHTML = ""; // Clear existing rows

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


    updateSortArrows(); // Update arrows to show sort direction
}

// ================================
// ----- Edit Book Inline -----
// Updates book object and secondary maps if needed
// ================================
function editBook(id, key, newValue) {
    const book = bookMap.get(id); // Get book from Map by ID (fast lookup)
    if (!book) return;
    book[key] = newValue.trim(); // Update the key dynamically (title, author, etc.)

    if (key === "genre") updateGenreFilter();        // Refresh dropdown if genre changed
    if (key === "title" || key === "author") rebuildSecondaryMaps(); // Rebuild title/author maps

    saveToLocalStorage(); // Persist changes and automatically save edits
}

// ================================
// ----- Remove Book -----
// Confirms and removes book from all data structures
// ================================
function removeBook(id) {
    const confirmed = confirm(`Are you sure you want to remove Book ID: ${id}?`);
    if (!confirmed) return;

    if (bookList.removeById(id)) {
        bookMap.delete(id);        // Remove from ID map
        rebuildSecondaryMaps();    // Rebuild Title/Author maps
        displayBooks(currentDisplayList); // Refresh table
        updateGenreFilter();       // Refresh genre dropdown
        alert(`Book ID ${id} removed successfully.`);
    }
}

// ================================
// ----- Filter Books -----
// Filters by ID, Title, Author, and Genre simultaneously
// ================================
function filterBooks() {
    // Optional chaining ?. prevents errors if element doesn't exist
    const idQuery = document.getElementById("searchId")?.value.trim().toLowerCase() || "";
    const titleQuery = document.getElementById("searchTitle")?.value.trim().toLowerCase() || "";
    const authorQuery = document.getElementById("searchAuthor")?.value.trim().toLowerCase() || "";
    const genreQuery = document.getElementById("genreFilter")?.value.trim().toLowerCase() || "";

    const allBooks = bookList.listBooks();
    const filtered = allBooks.filter(book =>
        (!idQuery || book.id.toLowerCase().includes(idQuery)) &&  // Includes for partial match
        (!titleQuery || book.title.toLowerCase().includes(titleQuery)) &&
        (!authorQuery || book.author.toLowerCase().includes(authorQuery)) &&
        (!genreQuery || book.genre.toLowerCase().includes(genreQuery))
    );

    displayBooks(filtered);
    if (currentSort.column) sortBooks(currentSort.column, filtered); // Keep sort on filtered list
}

// Clear all search filters
function clearFilters() {
    document.getElementById("searchId").value = "";
    document.getElementById("searchTitle").value = "";
    document.getElementById("searchAuthor").value = "";
    document.getElementById("genreFilter").value = "";
    displayBooks(); // Show full list again
}

// ================================
// ----- Sort Books (Custom Bubble Sort) -----
// Sorts only the currently displayed books
// ================================
function sortBooks(key, booksArray = null) {
    if (!booksArray) booksArray = currentDisplayList;

    // Toggle ascending/descending if same column clicked again
    if (currentSort.column === key) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = key;
        currentSort.ascending = true;
    }

    // Bubble sort implementation
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < booksArray.length - 1; i++) {
            const aVal = booksArray[i][key]?.toString().toLowerCase() || ""; // Optional chaining + default empty string
            const bVal = booksArray[i + 1][key]?.toString().toLowerCase() || "";
            // Ternary like logic for swapping based on ascending/descending
            if ((currentSort.ascending && aVal > bVal) || (!currentSort.ascending && aVal < bVal)) {
                [booksArray[i], booksArray[i + 1]] = [booksArray[i + 1], booksArray[i]]; // Array destructuring swap
                swapped = true;
            }
        }
    } while (swapped);

    displayBooks(booksArray);
}

// ================================
// ----- Update Sort Arrows -----
// Shows ▲ / ▼ in table headers for current sort column
// ================================
function updateSortArrows() {
    const headers = document.querySelectorAll('#booksTable th');
    headers.forEach(th => {
        const arrowSpan = th.querySelector('.arrow'); // Get arrow span inside <th>
        if (!arrowSpan) return;
        const col = th.dataset.column; // Data attribute tells which column
        arrowSpan.textContent = (col === currentSort.column) ? (currentSort.ascending ? '▲' : '▼') : '';
        // Nested ternary explained: if this column is the current sort, show arrow up or down, else show empty
    });
}

// ================================
// ----- Genre Dropdown -----
// Populates genre <select> dynamically based on current books
// ================================
function updateGenreFilter() {
    const genreSelect = document.getElementById("genreFilter");
    // Use Set to get unique genres, filter out empty strings
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
// ----- CSV Load & Save -----
// Load books from CSV and save current list to CSV
// ================================
function loadCSV() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
    if (!file) { alert("Please select a CSV file!"); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        parseCSV(e.target.result);
        updateGenreFilter();
        displayBooks(bookList.listBooks());
    };
    reader.readAsText(file); 
}

// Parse CSV and add books
function parseCSV(csvText) {
    const lines = csvText.split("\n"); // Split file into lines
    for (let i = 1; i < lines.length; i++) { // Skip header line
        const line = lines[i].trim();
        if (!line) continue;

        // Destructuring with default values for missing columns
        const [id, title, author = "", genre = "", availability = ""] = line.split(",").map(c => c.trim());
        if (!id || !title || bookMap.has(id)) continue; // Skip invalid or duplicate

        const book = new Book(id, title, author, genre, availability);
        bookList.add(book);
        bookMap.set(id, book);
        addToSecondaryMaps(book);
    }
}

// Save current book list to CSV
function saveCSV() {
    const books = bookList.listBooks();
    let csvContent = "ID,Title,Author,Genre,Availability\n";
    books.forEach(b => csvContent += `${b.id},${b.title},${b.author},${b.genre},${b.availability}\n`);

    const blob = new Blob([csvContent], { type: 'text/csv' }); // Blob object for file
    const url = URL.createObjectURL(blob); // Create download link
    const a = document.createElement("a");
    a.href = url;
    a.download = "books_inventory.csv";
    a.click(); // Trigger download
    URL.revokeObjectURL(url); // Clean up memory
}

// ================================
// ----- Load Open Library Books -----
// loads in the top 10 books and add them to table 
// ================================

async function fetchBooksFromOpenLibrary() {
    const query = document.getElementById("openLibrarySearch").value.trim();
    if (!query) {
        alert("Please enter a search term!");
        return;
    }

    try {
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10`);
        const data = await response.json();

        // Clear previous search results (optional)
        // currentDisplayList = [];
        
        data.docs.forEach(doc => {
            const id = doc.key.replace("/works/", ""); // use unique work key as ID
            const title = doc.title || "Unknown Title";
            const author = doc.author_name ? doc.author_name.join(", ") : "Unknown Author";
            const genre = doc.subject ? doc.subject[0] : "General";
            const availability = "In Stock";

            // Avoid duplicates by ID
            if (bookMap.has(id)) return;

            const book = new Book(id, title, author, genre, availability);
            bookList.add(book);
            bookMap.set(id, book);
            addToSecondaryMaps(book);
        });

        updateGenreFilter();
        displayBooks(bookList.listBooks());
        saveToLocalStorage(); // Optional: persist these books automatically
    } catch (err) {
        console.error("Error fetching from Open Library:", err);
        alert("Failed to fetch books. Check console for details.");
    }
}

// ================================
// ----- Clear Form Inputs -----
// Reset input fields after adding a book
// ================================
function clearInputs() {
    document.getElementById("bookId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("availability").value = "In Stock"; 
}

// Load saved books when page loads
window.addEventListener('DOMContentLoaded', loadFromLocalStorage); //Ensures the function runs after the HTML is ready. Any books previously saved in LocalStorage will populate your linked list, maps, and table automatically. 
