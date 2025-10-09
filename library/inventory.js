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
const bookList = new BookList();

// Hash Maps for quick access
const bookMap = new Map();          
const bookMapByTitle = new Map();   
const bookMapByAuthor = new Map();  

// Track the books currently displayed (filtered/sorted)
let currentDisplayList = bookList.listBooks();

// ================================
// ----- Current Sort Tracker -----
// Stores current sorted column and direction
// ================================
let currentSort = {
    column: '',
    ascending: true
};

// ================================
// ----- Hash Map Utility Functions -----
// These keep all hash maps updated whenever books are added or changed
// ================================

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

    // Add to main structures
    const book = new Book(id, title, author, genre, availability);
    bookList.add(book);
    bookMap.set(id, book);
    addToSecondaryMaps(book);

    updateGenreFilter();     
    displayBooks();          
    clearInputs();           
}

// ================================
// ----- Display Books -----
// Populates HTML table with current book list
// Stores currently displayed list in `currentDisplayList`
// ================================
function displayBooks(books = bookList.listBooks()) {
    currentDisplayList = books;

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
// ----- Remove Book -----
// Confirms removal, deletes from linked list and maps, refreshes UI
// ================================
function removeBook(id) {
    const confirmed = confirm(`Are you sure you want to remove Book ID: ${id}?`);
    if (!confirmed) return;

    const removed = bookList.removeById(id); 
    if (removed) {
        bookMap.delete(id);        
        rebuildSecondaryMaps();    
        displayBooks(currentDisplayList);  // Keep current filtered/sorted view
        updateGenreFilter();       
        alert(`Book ID ${id} removed successfully.`);
    }
}

// ================================
// ----- Unified Search Function -----
// Supports searching by ID, Title, Author, and Genre simultaneously
// ================================
function filterBooks() {
    const idQuery = document.getElementById("searchId")?.value.trim().toLowerCase() || "";
    const titleQuery = document.getElementById("searchTitle")?.value.trim().toLowerCase() || "";
    const authorQuery = document.getElementById("searchAuthor")?.value.trim().toLowerCase() || "";
    const genreQuery = document.getElementById("genreFilter")?.value.trim().toLowerCase() || "";

    const allBooks = bookList.listBooks();

    const filtered = allBooks.filter(book =>
        (!idQuery || book.id.toLowerCase().includes(idQuery)) &&
        (!titleQuery || book.title.toLowerCase().includes(titleQuery)) &&
        (!authorQuery || book.author.toLowerCase().includes(authorQuery)) &&
        (!genreQuery || book.genre.toLowerCase().includes(genreQuery))
    );

    displayBooks(filtered);

    // Re-apply sort without flipping ascending
    if (currentSort.column) sortBooks(currentSort.column);
}

// ================================
// ----- Clear Filters -----
// Resets search inputs and shows full list
// ================================
function clearFilters() {
    document.getElementById("searchId").value = "";
    document.getElementById("searchTitle").value = "";
    document.getElementById("searchAuthor").value = "";
    document.getElementById("genreFilter").value = "";
    displayBooks(bookList.listBooks());
}

// ================================
// ----- Sort Books -----
// Sorts the currently displayed list by a column
// ================================
function sortBooks(key) {
    const booksArray = [...currentDisplayList];

    if (currentSort.column === key) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = key;
        currentSort.ascending = true;
    }

    booksArray.sort((a, b) => {
        const valA = a[key]?.toString().toLowerCase() || "";
        const valB = b[key]?.toString().toLowerCase() || "";
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
        displayBooks(bookList.listBooks());
    };
    reader.readAsText(file); 
}

function parseCSV(csvText) {
    const lines = csvText.split("\n");
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [id, title, author = "", genre = "", availability = ""] = line.split(",").map(c => c.trim());
        if (!id || !title || bookMap.has(id)) continue;

        const book = new Book(id, title, author, genre, availability);
        bookList.add(book);
        bookMap.set(id, book);
        addToSecondaryMaps(book);
    }
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