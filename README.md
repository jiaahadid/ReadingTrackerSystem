# Tiny Tales Tracker

A desktop reading tracker built with Electron and JavaScript. Search books by author, save them to a personal reading list, mark them as read, and add summaries.

## Features

- Search books by author using the [Open Library](https://openlibrary.org/) API
- Add books to a personal reading list
- Mark books as read or unread
- Add and edit summaries
- Filter the reading list by title or author
- Clear the whole list
- List is saved in the browser (`localStorage`)

## How to run

You need [Node.js](https://nodejs.org/) installed.

```bash
npm install
npm start
```

## How to use

1. Enter an author name and click **Search**.
2. Click **Add to Reading List** on a book. A popup will say **added**.
3. Open **Go to Reading List** to view saved books.
4. From there you can mark books as read, write a summary, search the list, or delete books.

## Project files

| File | What it does |
|------|----------------|
| `main.js` | Starts the Electron app window |
| `index.html` | Search page |
| `readinglist.html` | Reading list page |
| `renderer.js` | Search, add, save, and list actions |
| `style.css` | App look and layout |

## Tech

- Electron
- JavaScript, HTML, CSS
- Open Library Search API
