// ----- Book Class -----
class Book {
    constructor(id, title, author, genre, availability) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.availability = availability;
    }
}

// ----- Double-Linked List Node -----
class Node {
    constructor(book) {
        this.book = book;
        this.prev = null;
        this.next = null;
    }
}

// ----- Double-Linked List -----
class BookList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    addBook(book) {
        const node = new Node(book);
        if (!this.head) {
            this.head = this.tail = node;
        } else {
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
        }
    }

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

// ----- Simple Hash Table -----
class BookHash {
    constructor() {
        this.table = {};
    }

    add(book) {
        this.table[book.id] = book;
    }

    get(id) {
        return this.table[id] || null;
    }
}

// ----- Initialize -----
const bookList = new BookList();
const bookHash = new BookHash();

// ----- Add Book Function (Manual Entry) -----
function addBook() {
    const id = document.getElementById("bookId").value;
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const genre = document.getElementById("genre").value;
    const availability = document.getElementById("availability").value;

    if (!id || !title) {
        alert("Book ID and Title are required!");
        return;
    }

    const book = new Book(id, title, author, genre, availability);
    bookList.addBook(book);
    bookHash.add(book);
    displayBooks();
}

// ----- Display Books -----
function displayBooks() {
    const ul = document.getElementById("booksUl");
    ul.innerHTML = "";
    const books = bookList.listBooks();
    books.forEach(book => {
        const li = document.createElement("li");
        li.textContent = `ID: ${book.id}, Title: ${book.title}, Author: ${book.author}, Genre: ${book.genre}, Availability: ${book.availability}`;
        ul.appendChild(li);
    });
}

// ----- Load CSV Function -----
function loadCSV() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a CSV file!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
        displayBooks();
    };
    reader.readAsText(file);
}

// ----- Parse CSV and Add Books -----
function parseCSV(csvText) {
    const lines = csvText.split("\n");
    for (let i = 1; i < lines.length; i++) { // skip header
        const line = lines[i].trim();
        if (line === "") continue;
        const [id, title, author, genre, availability] = line.split(",");
        const book = new Book(id, title, author, genre, availability);
        bookList.addBook(book);
        bookHash.add(book);
    }
}
