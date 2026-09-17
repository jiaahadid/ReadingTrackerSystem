// 🌸 Get elements
const searchBtn = document.getElementById('searchBtn');
const authorInput = document.getElementById('authorSearch');
const searchResults = document.getElementById('searchResults');
const bookList = document.getElementById('bookList');
const filterInput = document.getElementById('filterInput');
const clearAllBtn = document.getElementById('clearAll');

// 🌸 Load saved books
let myBooks = [];
try {
  const saved = JSON.parse(localStorage.getItem('myBooks'));
  myBooks = Array.isArray(saved) ? saved : [];
} catch (e) {
  myBooks = [];
}

// 🌸 Render books in reading list
function renderMyBooks(filter = "") {
  if (!bookList) return; // safeguard if bookList not on this page

  bookList.innerHTML = '';

  const filtered = myBooks.filter(b =>
    (b.title || '').toLowerCase().includes(filter.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    bookList.innerHTML = '<p>No books found. Try adding or changing your search.</p>';
    return;
  }

  filtered.forEach((book) => {
    const index = myBooks.indexOf(book);
    const div = document.createElement('div');
    div.className = `book ${book.read ? 'read' : ''}`;
    div.dataset.index = index;

    div.innerHTML = `
      <h3>${book.title}</h3>
      <p><b>Author:</b> ${book.author}</p>
      <p><b>Edition:</b> ${book.edition || 'N/A'}</p>
      <p><b>Published:</b> ${book.year || 'Unknown'}</p>
      <p><b>E-book:</b> ${book.ebook ? '✅ Yes' : '❌ No'}</p>
      <p><b>Status:</b> ${book.read ? '✔️ Read' : '📖 Not Read'}</p>

      <p><b>Summary:</b>
        <span class="summary-text">${book.summary || '<i>No summary yet.</i>'}</span>
        <textarea class="summary-input" style="display:none;">${book.summary || ''}</textarea>
      </p>

      <div class="actions">
        <button class="mark-read">${book.read ? 'Mark Unread' : 'Mark as Read'}</button>
        <button class="add-summary">🪶 Add / Edit Summary</button>
        <button class="delete">🗑 Delete</button>
      </div>
    `;

    bookList.appendChild(div);
  });
}

// 🌸 Save list to localStorage
function saveBooks() {
  localStorage.setItem('myBooks', JSON.stringify(myBooks));
  renderMyBooks(filterInput ? filterInput.value : "");
}

// 🌸 Event delegation for book actions
if (bookList) {
  bookList.addEventListener('click', e => {
    const bookDiv = e.target.closest('.book');
    if (!bookDiv) return;
    const index = Number(bookDiv.dataset.index);
    if (!myBooks[index]) return;

    // Mark read/unread
    if (e.target.classList.contains('mark-read')) {
      myBooks[index].read = !myBooks[index].read;
      saveBooks();
    }

    // Add / Edit summary
    if (e.target.classList.contains('add-summary')) {
      const summaryText = bookDiv.querySelector('.summary-text');
      const summaryInput = bookDiv.querySelector('.summary-input');

      if (summaryInput.style.display === 'none') {
        summaryText.style.display = 'none';
        summaryInput.style.display = 'block';
        summaryInput.focus();
        e.target.textContent = '💾 Save Summary';
      } else {
        const value = summaryInput.value.trim();
        myBooks[index].summary = value;
        saveBooks();
        e.target.textContent = '🪶 Add / Edit Summary';
      }
    }

    // Delete book
    if (e.target.classList.contains('delete')) {
      if (confirm(`Are you sure you want to delete "${myBooks[index].title}"?`)) {
        myBooks.splice(index, 1);
        saveBooks();
      }
    }
  });
}

// 🌸 In-app popup (native alert() is often blocked in Electron)
function showPopup(message) {
  const existing = document.getElementById('app-popup');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'app-popup';
  overlay.className = 'popup-overlay';
  overlay.innerHTML = `
    <div class="popup-box">
      <p></p>
      <button type="button" class="popup-ok">OK</button>
    </div>
  `;
  overlay.querySelector('p').textContent = message;
  overlay.querySelector('.popup-ok').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

// 🌸 Add book to reading list
function addBook(title, author, year, ebook) {
  const exists = myBooks.some(b => b.title === title && b.author === author);
  if (exists) return showPopup("This book is already in your list!");

  const newBook = {
    title,
    author,
    year,
    ebook,
    edition: '',
    read: false,
    summary: ''
  };
  myBooks.push(newBook);
  saveBooks();
  showPopup('added');
}

// Make addBook globally accessible for search results
window.addBook = addBook;

// 🌸 Search books via OpenLibrary API
if (searchBtn) {
  searchBtn.addEventListener('click', async () => {
    const author = authorInput.value.trim();
    if (!author) return alert('Please enter an author name.');

    searchResults.innerHTML = '';
    searchBtn.disabled = true;
    searchBtn.textContent = '🔎 Searching...';

    try {
      const response = await fetch(`https://openlibrary.org/search.json?author=${encodeURIComponent(author)}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      if (!data.docs || !data.docs.length) {
        searchResults.innerHTML = 'No books found.';
        return;
      }

      searchResults.innerHTML = `<h3>Top Books by ${author}</h3>`;

      data.docs.slice(0, 10).forEach(book => {
        const title = book.title || 'Untitled';
        const authorName = book.author_name ? book.author_name[0] : author;
        const year = book.first_publish_year || 'N/A';
        const ebook = book.ebook_access === 'public' || book.has_fulltext;

        const div = document.createElement('div');
        div.className = 'book';
        div.innerHTML = `
          <b></b>
          <p>First Published: ${year}</p>
          <p>E-book: ${ebook ? '✅ Yes' : '❌ No'}</p>
        `;
        div.querySelector('b').textContent = title;
        const addBtn = document.createElement('button');
        addBtn.textContent = '➕ Add to Reading List';
        addBtn.addEventListener('click', () => addBook(title, authorName, year, ebook));
        div.appendChild(addBtn);
        searchResults.appendChild(div);
      });
    } catch (error) {
      console.error(error);
      searchResults.innerHTML = '❌ Failed to fetch. Please check your connection or try again later.';
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = 'Search';
    }
  });
}

// 🌸 Filter reading list
if (filterInput) {
  filterInput.addEventListener('input', e => {
    renderMyBooks(e.target.value);
  });
}

// 🌸 Clear all books
if (clearAllBtn) {
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your reading list?')) {
      myBooks = [];
      saveBooks();
    }
  });
}

// 🌸 Initial render
renderMyBooks();
