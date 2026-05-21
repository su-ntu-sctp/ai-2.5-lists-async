# Lesson 2.5: Lists, Asynchronous Programming, and Side Effects

## Overview

- **Duration:** ~2 hours (hands-on lab)
- **Prerequisites:** Lesson 2.3: Unidirectional Data Flow and Conditional Rendering

## Learning Objectives

By the end of this lesson, you will be able to:

1. **Render** dynamic lists from API data using `map()` and the `key` prop
2. **Use** `useEffect` to fetch data from an API on component mount
3. **Handle** loading and error states during asynchronous operations
4. **Perform** POST and DELETE requests to create and remove records

## Introduction

Your CRM app currently loads customer data from a hardcoded file. Today you'll replace that with real API calls to a local API server. Along the way you'll learn how to manage the loading and error states that come with network requests, and how to send data back to the server when creating or deleting customers. By the end of the lab, your CRM will be a fully connected frontend; every change you make will persist across page reloads.

---

## Part 1: Connecting to the Backend (30 minutes)

### Starting Point

At the end of Lesson 2.3, your project should have:

- `App.jsx`: owns all state, handles search, renders the layout
- `CustomerCard.jsx`: displays a single customer
- `mockData.js`: hardcoded customer array

Start the dev server and confirm the app is running:

```bash
cd simple-crm-web
npm run dev
```

Navigate to `http://localhost:5173` and verify you can see the customer list.

### Setting Up json-server

Instead of a full backend, we'll use **json-server**, a tool that reads a plain JSON file and instantly turns it into a REST API. It supports GET, POST, PUT, PATCH, and DELETE out of the box, and it writes changes back to the file so data persists between page reloads. This is an ideal stand-in while you're learning how React communicates with an API; later in the course you'll connect to a real backend.

**Step 1: Install json-server**

In your project directory, install it as a dev dependency:

```bash
npm install --save-dev json-server
```

**Step 2: Create the seed data file**

Create a file called `db.json` in the root of your project (next to `package.json`). This is the "database" json-server reads from and writes to:

```json
{
  "customers": [
    {
      "id": 1,
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@example.com",
      "contactNo": "555-0101",
      "jobTitle": "Product Manager",
      "yearOfBirth": 1990
    },
    {
      "id": 2,
      "firstName": "Bob",
      "lastName": "Smith",
      "email": "bob.smith@example.com",
      "contactNo": "555-0102",
      "jobTitle": "Software Engineer",
      "yearOfBirth": 1985
    },
    {
      "id": 3,
      "firstName": "Carol",
      "lastName": "Williams",
      "email": "carol.williams@example.com",
      "contactNo": "555-0103",
      "jobTitle": "UX Designer",
      "yearOfBirth": 1992
    },
    {
      "id": 4,
      "firstName": "David",
      "lastName": "Brown",
      "email": "david.brown@example.com",
      "contactNo": null,
      "jobTitle": "Data Analyst",
      "yearOfBirth": 1988
    },
    {
      "id": 5,
      "firstName": "Emma",
      "lastName": "Davis",
      "email": "emma.davis@example.com",
      "contactNo": "555-0105",
      "jobTitle": null,
      "yearOfBirth": 1995
    }
  ]
}
```

**Step 3: Add a script to `package.json`**

Open `package.json` and add a `server` script under `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "server": "json-server --watch db.json --port 3001"
}
```

**Step 4: Start the API server**

Open a **second terminal** (keep your Vite dev server running in the first), and run:

```bash
npm run server
```

You should see output like:

```
JSON Server started on PORT :3001
Press CTRL-C to stop
Watching db.json...
```

Confirm it's working by opening `http://localhost:3001/customers` in your browser. You should see the JSON array of customers from your `db.json` file.

> **Two terminals:** json-server and the Vite dev server must both be running at the same time. Keep both terminal windows open throughout the lesson.

### The API

json-server provides these endpoints automatically based on the keys in `db.json`:

| Method | URL | Description |
|---|---|---|
| GET | `/customers` | Fetch all customers |
| POST | `/customers` | Create a new customer |
| DELETE | `/customers/{id}` | Delete a customer by ID |

The customer object shape:

```json
{
  "id": 1,
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@example.com",
  "contactNo": "555-0101",
  "jobTitle": "Product Manager",
  "yearOfBirth": 1990
}
```

### The Component Lifecycle

Before writing `useEffect`, it's worth understanding when React calls your component function and what that means for side effects.

Every component goes through three phases:

- **Mount**: the component appears in the UI for the first time. React calls your function, renders the JSX, and updates the DOM.
- **Update**: props or state change. React calls your function again and patches only what changed in the DOM.
- **Unmount**: the component is removed from the UI (e.g., navigating away, a conditional renders it out).

Your component function is **just a function**; React calls it on mount and on every update. It can run dozens of times during a user session. Any code at the top level of your component runs on every single one of those calls.

### Why useEffect?

Fetching data is a **side effect**: it reaches outside the component to the network. Side effects do not belong in the render function, because the render function runs on every re-render. Calling `fetch` directly in render would fire a request on every render, which would trigger a state update, which would trigger another render, which would fire another request, creating an infinite loop.

`useEffect` runs _after_ React has updated the DOM, at a specific lifecycle moment you control with the dependency array. An empty array `[]` means "run once, after the first render (mount only)". That's exactly what we need for an initial data load.

### Step 1: Remove the mock data import

Open `src/App.jsx`. At the top, remove the import of `mockCustomers` and `generateCustomerId`:

```jsx
// Remove this line:
import { mockCustomers } from "./mockData";
```

### Step 2: Add state for customers, loading, and error

Replace the `customers` state initialisation. We also add `loading` (to show a spinner while the request is in flight) and `error` (to show a message if it fails).

```jsx
// src/App.jsx
import { useState, useEffect } from "react";
import CustomerCard from "./components/CustomerCard";
import "./App.css";

const API_BASE = "http://localhost:3001";

function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... rest of component
}
```

We start `loading` as `true`; that way the app never flashes an empty list before the first fetch completes.

### Step 3: Fetch customers with useEffect

Add a `useEffect` that fetches the customer list on mount. Because the callback inside `useEffect` cannot be `async`, we define an async function inside it and call it immediately:

```jsx
useEffect(() => {
  async function loadCustomers() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/customers`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  loadCustomers();
}, []); // empty array: run once on mount
```

`try / catch / finally` ensures:
- `try`: we attempt the fetch and parse the JSON
- `catch`: if anything goes wrong (network error, bad status), we store the message
- `finally`: `loading` is always cleared, whether the fetch succeeded or failed

> **Common mistake:** Writing `useEffect(async () => {...}, [])`. An async function returns a Promise, but `useEffect` expects either nothing or a cleanup function. Making the callback itself async causes React to silently swallow errors and can cause unexpected behaviour. Always define the async function _inside_.

### Step 4: Render loading and error states

Before the main `return`, add guards for the two non-data states:

```jsx
if (loading) return <p className="status-message">Loading customers...</p>;
if (error)   return <p className="status-message error">Error: {error}</p>;
```

### Step 5: Update the return to use real data

Replace any reference to `mockCustomers` with the `customers` state:

```jsx
return (
  <div className="simple-crm">
    <h1>Simple CRM</h1>

    <div className="customer-list">
      <h2>Customers ({customers.length})</h2>
      <div className="customers">
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  </div>
);
```

**Browser check:** Reload the page. You should see the loading message briefly, then the customer list populated from the API. Open the Network tab in DevTools; you should see a GET request to `http://localhost:3001/customers`.

To test the error state, stop the json-server (`Ctrl+C` in its terminal) and reload the page. You should see the error message. Start it again before continuing.

### The complete `App.jsx` so far

```jsx
// src/App.jsx
import { useState, useEffect } from "react";
import CustomerCard from "./components/CustomerCard";
import "./App.css";

const API_BASE = "http://localhost:3001";

function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/customers`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  if (loading) return <p className="status-message">Loading customers...</p>;
  if (error)   return <p className="status-message error">Error: {error}</p>;

  return (
    <div className="simple-crm">
      <h1>Simple CRM</h1>

      <div className="customer-list">
        <h2>Customers ({customers.length})</h2>
        <div className="customers">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
```

---

## Part 2: Adding Customers via POST (25 minutes)

Now we'll wire up the Add Customer form to send data to the API instead of just updating local state.

### Step 1: Add the form state back to App

Add state for the form fields and a `submitting` flag (to disable the button while the request is in-flight):

```jsx
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [submitting, setSubmitting] = useState(false);
```

### Step 2: Write the handleAddCustomer function

This sends a POST request to the backend. On success, we append the newly created customer (which comes back with a server-assigned ID) to the state array.

```jsx
async function handleAddCustomer(e) {
  e.preventDefault();
  setSubmitting(true);

  try {
    const response = await fetch(`${API_BASE}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add customer: ${response.status}`);
    }

    const created = await response.json();
    setCustomers([...customers, created]);
    setFirstName("");
    setLastName("");
    setEmail("");
  } catch (err) {
    alert(err.message);
  } finally {
    setSubmitting(false);
  }
}
```

The `Content-Type: application/json` header tells the server that the request body is JSON. Without it, the server will not parse the body correctly.

We use the response body (`created`) to update state rather than constructing the object ourselves. This ensures the ID in our local state matches what the database actually assigned.

### Step 3: Add the form to the return

```jsx
return (
  <div className="simple-crm">
    <h1>Simple CRM</h1>

    <form onSubmit={handleAddCustomer} className="add-customer-form">
      <h3>Add New Customer</h3>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add Customer"}
      </button>
    </form>

    <div className="customer-list">
      <h2>Customers ({customers.length})</h2>
      <div className="customers">
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  </div>
);
```

**Browser check:** Fill in the form and submit. The new customer should appear in the list immediately. Reload the page; the customer should still be there, because json-server wrote it to `db.json`.

> **Why do we append `created` and not the form data?** The server assigns the `id`. If we built the object ourselves using the form fields, we'd have no ID, and without a stable ID, the `key` prop on the card would be wrong.

---

## Part 3: Deleting Customers via DELETE (20 minutes)

### Step 1: Update CustomerCard to accept a delete callback

Open `src/components/CustomerCard.jsx` and add an `onDelete` prop and a Delete button:

```jsx
// src/components/CustomerCard.jsx
import styles from "./CustomerCard.module.css";

function CustomerCard({ customer, onDelete }) {
  return (
    <div className={styles.card}>
      <p className={styles.name}>
        {customer.firstName} {customer.lastName}
      </p>
      <p className={styles.email}>{customer.email}</p>
      <p>Phone: {customer.contactNo || "N/A"}</p>
      <p>Job: {customer.jobTitle || "N/A"}</p>
      <button onClick={() => onDelete(customer.id)}>Delete</button>
    </div>
  );
}

export default CustomerCard;
```

### Step 2: Write the handleDeleteCustomer function in App

Add this function to `App.jsx`. It calls the DELETE endpoint and, only if the server confirms success, removes the customer from local state.

```jsx
async function handleDeleteCustomer(customerId) {
  try {
    const response = await fetch(`${API_BASE}/customers/${customerId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete customer: ${response.status}`);
    }

    setCustomers(customers.filter((c) => c.id !== customerId));
  } catch (err) {
    alert(err.message);
  }
}
```

We remove the customer from state _only after_ the server returns success. If we removed it first and the request failed, the UI would show the customer as gone while it still exists in the database.

### Step 3: Pass onDelete down to CustomerCard

In the `customers.map()` call inside the return:

```jsx
{customers.map((customer) => (
  <CustomerCard
    key={customer.id}
    customer={customer}
    onDelete={handleDeleteCustomer}
  />
))}
```

**Browser check:** Click Delete on a customer. The card should disappear. Reload the page; the customer should be gone, because json-server removed it from `db.json`.

---

## Activity: Client-Side Search Filter (20 minutes)

You've fetched, added, and deleted customers via the API. Now apply what you know about `filter()` and derived state to add a live search bar; no API calls needed for this one.

**Task:** Add a search input above the customer list. As the user types, filter the displayed cards by first name, last name, or email. Show the count of results.

**Hints:**
1. Add `const [searchTerm, setSearchTerm] = useState("")` to `App`
2. Compute `filteredCustomers` by calling `.filter()` on `customers`; do this during render, not in state
3. Use `String.toLowerCase()` and `String.includes()` to make the search case-insensitive
4. Render the `<input>` above the customer list; wire its `value` and `onChange` to `searchTerm` and `setSearchTerm`

<details>
<summary>Reference solution</summary>

In `App.jsx`, add search state and derive the filtered list:

```jsx
const [searchTerm, setSearchTerm] = useState("");

const filteredCustomers = customers.filter((c) => {
  const term = searchTerm.toLowerCase();
  return (
    c.firstName.toLowerCase().includes(term) ||
    c.lastName.toLowerCase().includes(term) ||
    c.email.toLowerCase().includes(term)
  );
});
```

Add the input and update the list to use `filteredCustomers`:

```jsx
<input
  type="text"
  placeholder="Search customers..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="search-input"
/>

<div className="customer-list">
  <h2>Customers ({filteredCustomers.length})</h2>
  <div className="customers">
    {filteredCustomers.map((customer) => (
      <CustomerCard
        key={customer.id}
        customer={customer}
        onDelete={handleDeleteCustomer}
      />
    ))}
  </div>
</div>
```

</details>

---

## The Complete App.jsx

Here is the full `App.jsx` after all four parts, for reference:

```jsx
// src/App.jsx
import { useState, useEffect } from "react";
import CustomerCard from "./components/CustomerCard";
import "./App.css";

const API_BASE = "http://localhost:3001";

function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/customers`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  async function handleAddCustomer(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add customer: ${response.status}`);
      }
      const created = await response.json();
      setCustomers([...customers, created]);
      setFirstName("");
      setLastName("");
      setEmail("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCustomer(customerId) {
    try {
      const response = await fetch(`${API_BASE}/customers/${customerId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete customer: ${response.status}`);
      }
      setCustomers(customers.filter((c) => c.id !== customerId));
    } catch (err) {
      alert(err.message);
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  if (loading) return <p className="status-message">Loading customers...</p>;
  if (error)   return <p className="status-message error">Error: {error}</p>;

  return (
    <div className="simple-crm">
      <h1>Simple CRM</h1>

      <form onSubmit={handleAddCustomer} className="add-customer-form">
        <h3>Add New Customer</h3>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Customer"}
        </button>
      </form>

      <input
        type="text"
        placeholder="Search customers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="customer-list">
        <h2>Customers ({filteredCustomers.length})</h2>
        <div className="customers">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onDelete={handleDeleteCustomer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
```

---

## Bonus Challenges

Work on as many as you can; they are listed in order of difficulty.

### Challenge 1: Empty State

When no customers match the search, show a "No customers match your search." message instead of an empty grid. When the customer list is completely empty, show "No customers yet. Add one above!"

**Hints:** Use a ternary on `filteredCustomers.length === 0`. Nest a second ternary inside to choose between the two messages based on `searchTerm`.

---

### Challenge 2: Per-Card Delete Loading State

Right now a customer disappears instantly when you click Delete, but there's no indication the request is in-flight. Add a loading state so the Delete button shows "Deleting..." while the request is pending, and disables to prevent double-clicks.

**Hints:**
- Add a `deletingId` state (e.g., `null` when nothing is being deleted, or the customer's `id` while the request is in-flight) to `App`
- Pass it down to `CustomerCard` and compare `deletingId === customer.id` to set the button label and `disabled` prop

---

### Challenge 3: Sort Controls

Add buttons above the customer list to sort by first name, last name, or email (A→Z). Clicking the active sort button a second time reverses the order (Z→A).

**Hints:**
- Add `sortField` and `sortDirection` state to `App`
- Compute `sortedCustomers` from `filteredCustomers` using `[...filteredCustomers].sort(...)`; spread first, as sort mutates in place
- Use `String.localeCompare()` for alphabetic sorting; flip the comparison when `sortDirection === "desc"`

---

### Challenge 4: Edit Customer (Advanced)

Add an Edit button to each customer card. Clicking it opens an inline form pre-filled with the customer's data. Submitting sends a PUT request to `/customers/{id}` and updates the card in place.

**Hints:**
- Track which customer is being edited with an `editingId` state in `App`
- Add an `onUpdate` callback that sends `PUT /customers/{id}` with the updated fields
- Update local state by mapping over `customers` and replacing the matching entry: `customers.map(c => c.id === id ? updated : c)`

---

## Summary

- **`map()` for lists:** transform an array of data into an array of JSX elements; always provide a stable `key` from the database ID
- **`useEffect` for side effects:** fetching data happens inside `useEffect`, not in the render function; an empty dependency array `[]` means "run once on mount"
- **Async inside `useEffect`:** define an `async` function inside the callback and call it; never make the `useEffect` callback itself `async`
- **Loading and error states:** always handle all three outcomes (loading, error, and data) so users are never left looking at a blank screen
- **POST and DELETE:** include `Content-Type: application/json` for POST; only update local state after the server confirms success; json-server writes changes to `db.json` so they survive a page reload
