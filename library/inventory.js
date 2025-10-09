// ================================
// inventory.js - Full Interactive with Advanced Search/Sort
// ================================

// ----- Book Class -----
// Represents a single book object
class Book {
    constructor(id, title, author, genre, availability) {
        this.id = id;             
        this.title = title;       
        this.author = author;     
        this.genre = genre;       
        this.availability = availability; 
    }
}

// ----- Node & Linked List Classes -----
// Node stores a book and links to previous/next nodes
class Node {
    constructor(book) {
        this.book = book;   
        this.prev = null;   
        this.next = null;   
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
// Linked list maintains order, hash maps allow instant lookup
const bookList = new BookList();
const bookMap = new Map();          // Lookup by ID
const bookMapByTitle = new Map();   // Lookup by Title
const bookMapByAuthor = new Map();  // Lookup by Author

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

    if (bookMap.has(id)) { 
        alert("Book ID already exists!");
        return;
    }

    const book = new Book(id, title, author, genre, availability);
    bookList.add(book);      
    bookMap.set(id, book);   
    addToSecondaryMaps(book); // Add to title/author maps

    updateGenreFilter();     
    displayBooks();          
    clearInputs();           
}

// ----- Add book to secondary hash maps -----
function addToSecondaryMaps(book) {
    // Note: For multiple books with same title/author, we store array of books
    if (!bookMapByTitle.has(book.title)) bookMapByTitle.set(book.title, []);
    bookMapByTitle.get(book.title).push(book);

    if (!bookMapByAuthor.has(book.author)) bookMapByAuthor.set(book.author, []);
    bookMapByAuthor.get(book.author).push(book);
}

// ----- Display Books -----
function displayBooks(books = bookList.listBooks()) {
    const tbody = document.getElementById("booksTableBody");
    tbody.innerHTML = ""; 

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
function editBook(id, key, newValue) {
    const book = bookMap.get(id);
    if (!book) return; 
    book[key] = newValue.trim(); 
    if (key === "genre") updateGenreFilter(); 
    // If title or author changes, update secondary maps:
    if (key === "title" || key === "author") rebuildSecondaryMaps(); 
}

// ----- Rebuild Secondary Maps -----
// Called after title/author edits to ensure consistency
function rebuildSecondaryMaps() {
    bookMapByTitle.clear();
    bookMapByAuthor.clear();
    bookList.listBooks().forEach(book => addToSecondaryMaps(book));
}

// ----- Remove Book -----
function removeBook(id) {
    const confirmed = confirm(`Are you sure you want to remove Book ID: ${id}?`);
    if (!confirmed) return;

    const removed = bookList.removeById(id); 
    if (removed) {
        const book = bookMap.get(id);
        bookMap.delete(id); 
        rebuildSecondaryMaps(); // Keep secondary maps updated
        displayBooks();     
        updateGenreFilter(); 
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

// ----- Search by Title -----
function searchBookByTitle() {
    const searchTitle = document.getElementById("searchTitle").value.trim();
    const books = bookMapByTitle.get(searchTitle) || [];
    displayBooks(books);
}

// ----- Search by Author -----
function searchBookByAuthor() {
    const searchAuthor = document.getElementById("searchAuthor").value.trim();
    const books = bookMapByAuthor.get(searchAuthor) || [];
    displayBooks(books);
}

// ----- Sort Books (Built-in) -----
let sortAscending = true;
function sortBooks(key) {
    const booksArray = bookList.listBooks(); 

    booksArray.sort((a, b) => {
        if (a[key] < b[key]) return sortAscending ? -1 : 1;
        if (a[key] > b[key]) return sortAscending ? 1 : -1;
        return 0;
    });

    sortAscending = !sortAscending; 
    displayBooks(booksArray);
}

// ----- Custom Bubble Sort Example -----
// Demonstrates manual sorting without using JS built-in .sort()
function bubbleSortBooks(key) {
    const arr = bookList.listBooks();
    let n = arr.length;
    for (let i = 0; i < n-1; i++) {
        for (let j = 0; j < n-i-1; j++) {
            if (arr[j][key] > arr[j+1][key]) {
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]]; // Swap
            }
        }
    }
    displayBooks(arr);
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
    reader.readAsText(file); 
}

// ----- Parse CSV Text -----
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
        addToSecondaryMaps(book); // Keep title/author maps updated
    }
}

// ----- Clear Form Inputs -----
function clearInputs() {
    document.getElementById("bookId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("availability").value = "In Stock"; 
}

// ----- Save Current Books to CSV -----
function saveCSV() {
    const books = bookList.listBooks(); 
    let csvContent = "ID,Title,Author,Genre,Availability\n"; 
    books.forEach(book => {
        const row = [
            book.id,
            `"${book.title.replace(/"/g, '""')}"`, 
            `"${book.author.replace(/"/g, '""')}"`,
            `"${book.genre.replace(/"/g, '""')}"`,
            `"${book.availability.replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "books_inventory.csv"; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); 
    URL.revokeObjectURL(url); 
}
