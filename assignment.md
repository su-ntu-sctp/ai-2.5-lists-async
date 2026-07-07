# Optional Assignment: Bookshelf Tracker

## Overview

- **Lesson:** Lists, Asynchronous Programming, and Side Effects / 2.5
- **Type:** Optional Take-Home Assignment
- **Estimated Time:** 2-3 hours
- **Submission:** GitHub repository link or ZIP file

## Learning Objectives Covered

This assignment reinforces:

- Rendering dynamic lists from API data using `map()` and the `key` prop
- Using `useEffect` to fetch data from an API on component mount
- Handling loading and error states during asynchronous operations
- Performing POST and DELETE requests to create and remove records

## Assignment Description

Build a **Bookshelf Tracker**: a small app for logging books someone is reading, has finished, or wants to read. The app fetches its book list from a local json-server API, lets the user add a new book, and lets the user remove a book. This project is intentionally separate from the CRM so that you can practise the same data-fetching patterns in a new domain without touching the CRM base project, which later lessons continue to build on.

### What You Will Build

A single-page application that:

- Fetches the list of books from json-server when the page loads
- Shows a loading indicator while the fetch is in progress
- Shows an error message if the fetch fails
- Displays each book's title, author, and reading status
- Has a form to add a new book, which sends a POST request and updates the list
- Has a delete button on each book, which sends a DELETE request and removes it from the list

## Requirements

### Core Requirements

#### 1. Project Setup

- [ ] Create a new React app using Vite: `npm create vite@latest bookshelf-tracker -- --template react`
- [ ] Install json-server as a dev dependency: `npm install --save-dev json-server`
- [ ] Create a `data/db.json` file (see seed data below) and add a `server` script to `package.json` that runs `json-server --watch data/db.json --port 3001`
- [ ] Run the Vite dev server and json-server in two separate terminals

#### 2. Book Data Structure

Each book should have the following shape:

```js
{
  id: 1,
  title: "The Pragmatic Programmer",
  author: "David Thomas & Andrew Hunt",
  status: "reading",   // "to-read", "reading", or "finished"
}
```

#### 3. Fetching the Book List

- [ ] In `App`, use `useState` to hold `books`, `isLoading`, and `error`
- [ ] Use `useEffect` to fetch `GET http://localhost:3001/books` once when `App` mounts
- [ ] Set `isLoading` to `true` before the request and back to `false` once it settles, whether it succeeds or fails
- [ ] If the request fails, set an `error` message and display it instead of the list
- [ ] While loading, show a "Loading books..." message instead of the list

#### 4. Components to Create

**a) `BookList`**

- [ ] Accepts `books` and `onDelete` as props
- [ ] Renders a `BookCard` for each book, using the book's `id` as the `key`
- [ ] Shows "No books yet. Add one below!" when `books` is empty

**b) `BookCard`**

- [ ] Accepts `book` and `onDelete` as props
- [ ] Displays title, author, and status
- [ ] Styled differently per status (e.g., a colored badge for "to-read" / "reading" / "finished")
- [ ] Has a Delete button that calls `onDelete` with the book's `id`

**c) `AddBookForm`**

- [ ] Accepts an `onAdd` callback prop
- [ ] Has controlled inputs for title (text), author (text), and status (select: to-read/reading/finished)
- [ ] Calls `onAdd` with the new book object on form submission
- [ ] Clears inputs after a successful submission
- [ ] Disables the submit button while the request is in flight

#### 5. Adding and Deleting Books

- [ ] `handleAddBook` in `App` sends a `POST` request to `http://localhost:3001/books` with the new book, then adds the server's response to `books` state
- [ ] `handleDeleteBook` in `App` sends a `DELETE` request to `http://localhost:3001/books/:id`, then removes the book from `books` state on success
- [ ] Both handlers are `async` functions and use `try`/`catch` to handle request failures

### Stretch Goals

- [ ] Add a status filter (All / To Read / Reading / Finished) above the list, following the same derived-state pattern used for the status filter activity in the lesson
- [ ] Add a per-book "Mark as finished" button that sends a `PATCH` request to update just the `status` field
- [ ] Show a per-card loading state on the Delete button so only the book being deleted shows a "Deleting..." label

## Example Seed Data

```json
{
  "books": [
    { "id": 1, "title": "The Pragmatic Programmer", "author": "David Thomas & Andrew Hunt", "status": "finished" },
    { "id": 2, "title": "Atomic Habits", "author": "James Clear", "status": "reading" },
    { "id": 3, "title": "Dune", "author": "Frank Herbert", "status": "to-read" },
    { "id": 4, "title": "Sapiens", "author": "Yuval Noah Harari", "status": "finished" },
    { "id": 5, "title": "Clean Code", "author": "Robert C. Martin", "status": "to-read" }
  ]
}
```

## Resources

- [React docs: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React docs: Rendering Lists](https://react.dev/learn/rendering-lists)
- [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [json-server documentation](https://github.com/typicode/json-server)
