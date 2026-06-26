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

Your CRM app currently loads customer data from a hardcoded file. Today you will replace that with real API calls to a local server. Along the way you will learn how to manage the loading and error states that come with network requests, and how to send data back to the server when creating or deleting customers. By the end of the lab, your CRM will be a fully connected frontend: every change you make will persist across page reloads.

---

## Part 1: Connecting to the Backend (30 minutes)

### Starting Point

At the end of Lesson 2.3, your `simple-crm-web` project looks like this:

```
simple-crm-web/
├── src/
│   ├── components/
│   │   ├── CustomerCard.jsx
│   │   ├── CustomerCard.module.css
│   │   ├── CustomerDetail.jsx
│   │   ├── CustomerDetail.module.css
│   │   ├── SearchBar.jsx
│   │   └── SearchBar.module.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── mockData.js
│   └── main.jsx
```

Start the dev server and confirm the app is running:

```bash
cd simple-crm-web
npm run dev
```

Navigate to `http://localhost:5173` and verify you can see the customer list, the search bar, and the detail panel.

### Setting Up json-server

Instead of a full backend, we will use **json-server**: a tool that reads a plain JSON file and instantly turns it into a REST API. It provides a full set of endpoints out of the box and writes changes back to the file so data persists between page reloads. This is an ideal stand-in while you are learning how React communicates with an API; later in the course you will connect to a real backend.

**Step 1: Install json-server**

In your project directory, install it as a dev dependency:

```bash
npm install --save-dev json-server
```

**Step 2: Create the seed data file**

Create a `data/` folder in the root of your project (next to `package.json`), then download [`assets/data/db.json`](assets/data/db.json) from the lesson materials and place it there:

```
simple-crm-web/
├── data/
│   └── db.json       ← add this
├── src/
├── package.json
└── ...
```

This is the "database" json-server reads from and writes to. The data shape matches exactly what your `CustomerCard` and `CustomerDetail` components already expect.

**Step 3: Add a script to `package.json`**

Open `package.json` and add a `server` script under `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "server": "json-server --watch data/db.json --port 3001"
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

Confirm it is working by opening `http://localhost:3001/customers` in your browser. You should see the JSON array from your `db.json` file.

> **Two terminals:** json-server and the Vite dev server must both be running at the same time. Keep both terminal windows open throughout the lesson.

### The API

json-server provides these endpoints automatically based on the keys in `db.json`:

| Method | URL | Description |
|---|---|---|
| GET | `/customers` | Fetch all customers |
| GET | `/customers/{id}` | Fetch a single customer |
| POST | `/customers` | Create a new customer |
| PUT | `/customers/{id}` | Replace a customer (all fields) |
| PATCH | `/customers/{id}` | Update a customer (partial fields) |
| DELETE | `/customers/{id}` | Delete a customer by ID |

In this lesson we will use GET, POST, and DELETE. PUT and PATCH become relevant once you add an edit feature (see Bonus Challenge 4).

### Step 1: Add the API base URL and wire up a manual load button

Open `src/App.jsx`. Add an exported constant for the API base URL just before the `App` function, and replace the `customers` state initialisation with an empty array (we will load from the API instead):

```jsx
export const API_BASE = "http://localhost:3001";

function App() {
  const [customers, setCustomers] = useState([]); // no longer initialised from mockData
  // ... rest of state unchanged
```

Now write a `loadCustomers` handler and add a button to the return that calls it. Place the button just below the `<h1>`:

```jsx
const loadCustomers = async () => {
  const response = await fetch(`${API_BASE}/customers`);
  const data = await response.json();
  setCustomers(data);
};

// In the return:
<button className="toggle-form-btn" onClick={loadCustomers}>
  Load Customers
</button>
```

**Browser check:** Open the app. The customer list is empty. Click "Load Customers". The cards should appear, complete with status badges and tags, fetched live from json-server. Open the Network tab in DevTools and click the button again; you should see a GET request to `http://localhost:3001/customers` each time you click.

This confirms that `fetch` works. The data is coming from the API, not from `mockData.js`.

### Step 2: Try calling loadCustomers directly in the component body

The button works, but we do not want users to have to click a button just to see the customer list. The data should load automatically when the page opens.

Your first instinct might be to call `loadCustomers()` directly in the component body, so it runs on every render:

```jsx
function App() {
  const [customers, setCustomers] = useState([]);

  const loadCustomers = async () => {
    const response = await fetch(`${API_BASE}/customers`);
    const data = await response.json();
    setCustomers(data);
  };

  loadCustomers(); // ← call it directly here
```

**Try it.** Add that call and watch what happens in the browser.

You will see the network tab light up with hundreds of requests in rapid succession, and your browser tab may freeze. Here is why:

1. React renders `App` and calls `loadCustomers()`
2. `loadCustomers()` resolves and calls `setCustomers(data)`
3. `setCustomers` triggers a re-render
4. React renders `App` again and calls `loadCustomers()` again
5. Repeat forever

This is an **infinite loop**. Any call to `setState` inside the render function causes another render, which causes another `setState`, and so on.

**Remove that line before continuing.**

> **The component lifecycle:** your component function is not called once; React calls it on every render. Every time state or props change, React calls your function again from the top. Code at the top level of your component runs on every single render, not just the first.

### Step 3: Introduce useEffect

We need a way to say: run this code **once, after the component first appears on screen**, not on every render. That is exactly what `useEffect` is for.

`useEffect` runs _after_ React has updated the DOM, at a lifecycle moment you control with the dependency array. An empty array `[]` means "run once on mount only":

```
Mount   → render → DOM update → ✅ useEffect runs (once)
Update  → render → DOM update → ✗  useEffect does not run again
```

Add `useEffect` to the import at the top of the file:

```jsx
import { useState, useEffect } from "react";
```

Now wrap `loadCustomers` in a `useEffect` with an empty dependency array. Because `loadCustomers` is now defined inside the effect, it is no longer accessible from outside, so the Load Customers button must go too.

Remove both of these from `App.jsx`:

```jsx
// Remove the standalone handler:
const loadCustomers = async () => {
  const response = await fetch(`${API_BASE}/customers`);
  const data = await response.json();
  setCustomers(data);
};

// Remove the button from the return:
<button className="toggle-form-btn" onClick={loadCustomers}>
  Load Customers
</button>
```

Replace them with a single `useEffect`:

```jsx
useEffect(() => {
  const loadCustomers = async () => {
    const response = await fetch(`${API_BASE}/customers`);
    const data = await response.json();
    setCustomers(data);
  };

  loadCustomers();
}, []); // empty array: run once on mount
```

> **Common mistake:** Writing `useEffect(async () => {...}, [])`. An async function returns a Promise, but `useEffect` expects either nothing or a cleanup function. Making the callback itself async causes React to silently swallow errors and can cause unexpected behaviour. Always define the async function _inside_.

**Browser check:** Reload the page. The customer list should populate automatically, without clicking any button. Check the Network tab; you should see exactly one GET request on page load, not a flood.

### Step 4: Add loading and error states

The fetch can fail: json-server might not be running, or the network might be slow. Right now the app would silently show an empty list if anything went wrong. We need to handle three outcomes: loading, error, and data.

Add both status message styles to `App.css`:

```css
/* src/App.css */
.status-message {
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.status-message.error {
  color: var(--danger-600);
  background: var(--danger-50, #f9eeed);
  border: 1px solid var(--danger-100, #f1d6d3);
}
```

Then add two new pieces of state to `App`:

```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

Now expand `loadCustomers` inside the `useEffect` to use `try / catch / finally`:

```jsx
useEffect(() => {
  const loadCustomers = async () => {
    setLoading(true);
    try {
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
  };

  loadCustomers();
}, []);
```

`try / catch / finally` ensures:
- `try`: we attempt the fetch and parse the JSON
- `catch`: if anything goes wrong (network error, bad status), we store the message
- `finally`: `loading` is always cleared, whether the fetch succeeded or failed

> **Why check `response.ok`?** `fetch` only rejects its Promise on a network failure (no connection at all). A 404 or 500 response from the server still resolves successfully. Always check `response.ok` to catch server-side errors.

Add early-return guards just before the main `return` in `App`:

```jsx
if (loading) return <p className="status-message">Loading customers...</p>;
if (error)   return <p className="status-message error">Error: {error}</p>;
```

### Step 5: Remove the mock data import

Now that the `useEffect` loads real data, remove the import of `mockCustomers` and `generateCustomerId` from `mockData.js`:

```jsx
// Remove this line:
import { mockCustomers, generateCustomerId } from "./mockData";
```

**Browser check:** Reload the page. You should see "Loading customers..." briefly, then the customer list populated from the API. To test the error state, stop json-server (`Ctrl+C` in its terminal) and reload; you should see the styled error message. Start it again before continuing.

### Step 6: Replace loading text with a spinner

The text loading state works, but a visual spinner communicates "something is happening" more naturally. We will install `react-spinners`, create a small shared `Spinner` component, and swap it in. Because both `App` and `CustomerDetail` (which we build in Part 4) need a loading indicator, wrapping the spinner in a component means we only configure it once.

Install `react-spinners`:

```bash
npm install react-spinners
```

Create `src/components/Spinner.jsx`:

```jsx
// src/components/Spinner.jsx
import { PulseLoader } from "react-spinners";
import styles from "./Spinner.module.css";

function Spinner({ size = 10 }) {
  return (
    <div className={styles.wrapper}>
      <PulseLoader color="var(--primary-500)" size={size} />
    </div>
  );
}

export default Spinner;
```

Create `src/components/Spinner.module.css`:

```css
/* src/components/Spinner.module.css */
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-8);
}
```

The `color` prop reads directly from our CSS token so the spinner matches the app's primary colour. The `size` prop lets us render a smaller version inside the narrow detail panel later.

Now add the import to `App.jsx` and replace the loading return:

```jsx
import Spinner from "./components/Spinner";
```

```jsx
// Replace:
if (loading) return <p className="status-message">Loading customers...</p>;
// With:
if (loading) return <Spinner />;
```

The `.status-message` rule in `App.css` is now only used by the error state, but you can leave it in place; `CustomerDetail` will use it too.

**Browser check:** Reload the page. The loading text should be replaced by the animated spinner.

---

## Part 2: Adding Customers via POST (25 minutes)

Your Add Customer form already exists and already collects `firstName`, `lastName`, `email`, `status`, and `tags`. Right now, `handleAddCustomer` generates a local ID with `generateCustomerId()` and adds the object directly to state. We will change it to send a POST request to the API instead, and use the server-assigned ID in state.

### Step 1: Add a submitting flag

Add one new piece of state to track when the POST request is in-flight. This lets us disable the submit button to prevent double-submits:

```jsx
const [submitting, setSubmitting] = useState(false);
```

### Step 2: Convert handleAddCustomer to an async function

Replace the existing `handleAddCustomer` with this async version. The form fields and reset logic remain the same; the only change is that we call the API and use its response instead of constructing the object locally:

```jsx
const handleAddCustomer = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  const newCustomer = {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: "",
    status: form.status,
    tags: form.tags,
    company: "",
    notes: "",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  try {
    const response = await fetch(`${API_BASE}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    });

    if (!response.ok) {
      throw new Error(`Failed to add customer: ${response.status}`);
    }

    const created = await response.json();
    setCustomers([...customers, created]);
    setForm({ firstName: "", lastName: "", email: "", tags: [], status: "active" });
    setShowForm(false);
  } catch (err) {
    alert(err.message);
  } finally {
    setSubmitting(false);
  }
};
```

The `Content-Type: application/json` header tells the server that the request body is JSON. Without it, the server will not parse the body correctly.

We use the response body (`created`) to update state rather than constructing the object ourselves. This ensures the ID in local state matches what the server actually assigned.

> **Why not use `generateCustomerId()` anymore?** The server is now the authority on IDs. If we generated the ID ourselves, it could clash with an ID the server would assign later. Always let the server be the source of truth for IDs.

### Step 3: Disable the submit button while submitting

Update the submit button in the form to use the `submitting` flag:

```jsx
<button type="submit" className="submit-button" disabled={submitting}>
  {submitting ? "Adding..." : "Add Customer"}
</button>
```

**Browser check:** Fill in the form and submit. The new customer should appear in the list. Reload the page; the customer should still be there, because json-server wrote it to `db.json`. Open `db.json` directly and you can see the new record.

---

## Part 3: Deleting Customers via DELETE (20 minutes)

You already have a `handleDeleteCustomer` function from Lesson 2.3. Right now it removes the customer from local state immediately. We will change it to call the DELETE endpoint first, and only update local state after the server confirms success.

### Step 1: Convert handleDeleteCustomer to an async function

Replace the existing `handleDeleteCustomer` with this version:

```jsx
const handleDeleteCustomer = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE}/customers/${customerId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete customer: ${response.status}`);
    }

    setCustomers(customers.filter((c) => c.id !== customerId));

    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null);
    }
  } catch (err) {
    alert(err.message);
  }
};
```

We remove the customer from state _only after_ the server returns success. If we removed it first and the request failed, the UI would show the customer as gone while it still exists in the database. The deselect logic from Lesson 2.3 stays intact.

> **Missing: delete loading state.** Unlike the Add form which has a `submitting` flag, this handler has no in-flight state. Without it, a user can click Delete multiple times before the first request completes, sending duplicate requests to the server. The fix requires tracking which specific customer is being deleted (a single boolean is not enough when there are multiple cards), which is what Bonus Challenge 2 covers.

**Browser check:** Click Delete on a customer card. The card should disappear and the detail panel should clear if that customer was selected. Reload the page; the customer should be gone, because json-server removed it from `db.json`.

---

## Part 4: Fetching a Single Customer with GET (15 minutes)

### Why fetch again? We already have the data

In Lesson 2.3, `CustomerDetail` received the full customer object as a prop: `App` passed down whatever was in `selectedCustomer`. That works because `GET /customers` already returned every field. So why would we fetch again?

In a real application, a list endpoint returns a **summary** of each record: enough to populate a card. A detail endpoint returns the **full record**: notes, interaction history, linked contacts, and any fields too expensive to include in a bulk response. The two endpoints return different shapes.

By teaching `CustomerDetail` to fetch `GET /customers/{id}` itself, we also exercise a pattern you have not used yet: **a `useEffect` that re-runs when a value changes**. Rather than an empty array `[]` meaning "once on mount", we pass the selected ID as a dependency so the effect re-runs every time the user selects a different customer.

```
// Pattern 2 (what we used in Part 1):
useEffect(() => { ... }, []);          // once on mount

// Pattern 3 (what we use now):
useEffect(() => { ... }, [selectedId]); // re-runs when selectedId changes
```

### Step 1: Change App to pass the ID instead of the object

In `App.jsx`, replace `selectedCustomer` (the full object) with `selectedId` (just the string). Update the state declaration and anywhere it is used:

```jsx
// Replace:
const [selectedCustomer, setSelectedCustomer] = useState(null);

// With:
const [selectedId, setSelectedId] = useState(null);
```

Update the `CustomerCard` map to pass `setSelectedId` and compare against `selectedId`:

```jsx
<CustomerCard
  key={customer.id}
  customer={customer}
  onDelete={handleDeleteCustomer}
  onSelect={setSelectedId}
  isSelected={selectedId === customer.id}
/>
```

Update the `handleDeleteCustomer` deselect logic:

```jsx
if (selectedId === customerId) {
  setSelectedId(null);
}
```

Pass `selectedId` to `CustomerDetail`:

```jsx
<CustomerDetail selectedId={selectedId} />
```

> The `onSelect` callback in `CustomerCard` calls `onSelect(customer)`, passing the whole object. We need it to pass only the ID. Open `CustomerCard.jsx` and change the `onClick` handler on the card `div`:
>
> ```jsx
> // Change:
> onClick={() => onSelect(customer)}
> // To:
> onClick={() => onSelect(customer.id)}
> ```

### Step 2: Rewrite CustomerDetail to fetch by ID

Open `src/components/CustomerDetail.jsx`. Replace the entire file with this version. It owns its own `loading`, `error`, and `customer` state, and fetches from the API whenever `selectedId` changes. Import `API_BASE` from `App.jsx` so the URL is defined in one place:

```jsx
// src/components/CustomerDetail.jsx
import { useState, useEffect } from "react";
import { API_BASE } from "../App";
import Spinner from "./Spinner";
import styles from "./CustomerDetail.module.css";

function CustomerDetail({ selectedId }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedId) return;

    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/customers/${selectedId}`);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [selectedId]);

  if (!selectedId) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Select a customer to view details.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Error: {error}</p>
      </div>
    );
  }

  if (loading || !customer) {
    return (
      <div className={styles.panel}>
        <Spinner size={8} />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.name}>
        {customer.firstName} {customer.lastName}
      </h2>
      {customer.company && (
        <p className={styles.company}>{customer.company}</p>
      )}

      <div>
        <p className={styles.contactRow}>{customer.email}</p>
        {customer.phone && (
          <p className={styles.contactRow}>{customer.phone}</p>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Status and tags</p>
        <div className={styles.tags}>
          <span
            className={`${styles.badge} ${customer.status === "active" ? styles.badgeActive : styles.badgeInactive}`}
          >
            {customer.status}
          </span>
          {customer.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Notes</p>
        {customer.notes ? (
          <p className={styles.notes}>{customer.notes}</p>
        ) : (
          <p className={styles.notesEmpty}>No notes yet.</p>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Customer since</p>
        <p className={styles.contactRow}>{customer.createdAt}</p>
      </div>
    </div>
  );
}

export default CustomerDetail;
```

Two things to notice here:

- The `useEffect` has an early return when `selectedId` is falsy. This skips the fetch entirely on initial mount when no customer has been selected yet: no network request is needed to show the empty state.
- `loading` starts as `false` (not `true`), because there is nothing to load until a customer is selected. Starting it as `true` would show the spinner before any card has been clicked.

**Browser check:** Click a customer card. The detail panel should show a brief spinner then populate with the customer's full data. Click a different card; the panel should update. Open the Network tab; you should see a GET request to `/customers/{id}` each time you click.

---

## Part 5: Updating a Customer with PATCH (optional, ~35 minutes)

### Step 1: Add an Edit button and edit mode state to CustomerDetail

We will add an inline edit form to the detail panel. When the user clicks Edit, the read view is replaced by a form pre-filled with the customer's current data. Submitting sends a PATCH request and updates both the detail panel and the card in the list.

First, add `handleUpdateCustomer` to `App.jsx`. It sends `PATCH /customers/{id}`, then updates the customer in the `customers` array so the card in the list reflects the change immediately:

```jsx
const handleUpdateCustomer = async (customerId, updates) => {
  try {
    const response = await fetch(`${API_BASE}/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update customer: ${response.status}`);
    }

    const updated = await response.json();
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? updated : c))
    );
  } catch (err) {
    alert(err.message);
  }
};
```

Pass it down to `CustomerDetail`:

```jsx
<CustomerDetail selectedId={selectedId} onUpdate={handleUpdateCustomer} />
```

### Step 2: Add edit mode and form state to CustomerDetail

Now update `CustomerDetail` to support edit mode. Add three pieces of state at the top of the component, after the existing state:

```jsx
const [isEditing, setIsEditing] = useState(false);
const [editForm, setEditForm] = useState({});
const [saving, setSaving] = useState(false);
```

Add three handlers: one to enter edit mode, one to track field changes, and one to submit the PATCH:

```jsx
const handleEditClick = () => {
  setEditForm({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone || "",
    company: customer.company || "",
    notes: customer.notes || "",
    status: customer.status,
    tags: customer.tags,
  });
  setIsEditing(true);
};

const handleEditChange = (e) => {
  setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleEditSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  try {
    await onUpdate(customer.id, editForm);
    setCustomer((prev) => ({ ...prev, ...editForm }));
    setIsEditing(false);
  } catch (err) {
    alert(err.message);
  } finally {
    setSaving(false);
  }
};
```

> **Why does `CustomerDetail` also update its own `customer` state after a successful save?** `App` updates the `customers` array (so the card in the list reflects the change), but `CustomerDetail` fetched its own copy of the customer independently. Without `setCustomer((prev) => ({ ...prev, ...editForm }))`, the detail panel would revert to the old values until the user clicked away and back again.

### Step 3: Add the edit form to the CustomerDetail return

Replace the final `return` block in `CustomerDetail` with this version, which uses a ternary to switch between the edit form and the read view:

```jsx
return (
  <div className={styles.panel}>
    {isEditing ? (
      <form onSubmit={handleEditSubmit}>
        <h2 className={styles.name}>Edit customer</h2>

        <div className={styles.section}>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              className={styles.input}
              value={editForm.firstName}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              name="lastName"
              className={styles.input}
              value={editForm.lastName}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              value={editForm.email}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              className={styles.input}
              value={editForm.phone}
              onChange={handleEditChange}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              className={styles.input}
              value={editForm.company}
              onChange={handleEditChange}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className={styles.input}
              value={editForm.notes}
              onChange={handleEditChange}
              rows={3}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className={styles.input}
              value={editForm.status}
              onChange={handleEditChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className={styles.editActions}>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    ) : (
      <>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.name}>
              {customer.firstName} {customer.lastName}
            </h2>
            {customer.company && (
              <p className={styles.company}>{customer.company}</p>
            )}
          </div>
          <button className={styles.editButton} onClick={handleEditClick}>
            Edit
          </button>
        </div>

        <div>
          <p className={styles.contactRow}>{customer.email}</p>
          {customer.phone && (
            <p className={styles.contactRow}>{customer.phone}</p>
          )}
        </div>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Status and tags</p>
          <div className={styles.tags}>
            <span
              className={`${styles.badge} ${customer.status === "active" ? styles.badgeActive : styles.badgeInactive}`}
            >
              {customer.status}
            </span>
            {customer.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Notes</p>
          {customer.notes ? (
            <p className={styles.notes}>{customer.notes}</p>
          ) : (
            <p className={styles.notesEmpty}>No notes yet.</p>
          )}
        </div>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Customer since</p>
          <p className={styles.contactRow}>{customer.createdAt}</p>
        </div>
      </>
    )}
  </div>
);
```

### Step 4: Add the new styles to CustomerDetail.module.css

Add these rules to the bottom of `src/components/CustomerDetail.module.css`:

```css
.panelHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.editButton {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  color: var(--primary-600);
  border: 1px solid var(--primary-300, var(--border-default));
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  cursor: pointer;
  flex: none;
  transition: background var(--duration-fast) var(--ease-standard);
}

.editButton:hover {
  background: var(--primary-50, var(--surface-hover));
}

.editField {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-strong);
  width: 100%;
  box-sizing: border-box;
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--ring);
}

textarea.input {
  resize: vertical;
}

.editActions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.saveButton {
  padding: var(--space-2) var(--space-4);
  background: var(--action-primary);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}

.saveButton:hover {
  background: var(--action-primary-hover);
}

.cancelButton {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--text-body);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}

.cancelButton:hover {
  background: var(--surface-hover);
}
```

**Browser check:** Click a customer card. Click the Edit button in the detail panel. Edit a field and click Save. The panel should switch back to read view showing the new values, and the customer card in the list should also reflect the change. Reload the page; the changes should persist because json-server wrote them to `db.json`.

---

## Optional Refactor: Extract CustomerView and CustomerEditForm

If time permits, walk through this refactor with the class. If not, learners can attempt it independently after the lesson.

Both branches of the ternary in `CustomerDetail` are long, which makes the component hard to scan. A natural response is to extract each branch into its own named component. This also demonstrates a broader principle: when a conditional renders a large chunk of JSX, that chunk is usually a good candidate for a component.

### Step A: Extract CustomerView and CustomerEditForm

Add both components at the top of `CustomerDetail.jsx`, above the `CustomerDetail` function itself.

`CustomerView` is purely presentational: it receives the customer data and a callback, and renders the read view:

```jsx
function CustomerView({ customer, onEditClick }) {
  return (
    <>
      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.name}>
            {customer.firstName} {customer.lastName}
          </h2>
          {customer.company && (
            <p className={styles.company}>{customer.company}</p>
          )}
        </div>
        <button className={styles.editButton} onClick={onEditClick}>
          Edit
        </button>
      </div>

      <div>
        <p className={styles.contactRow}>{customer.email}</p>
        {customer.phone && (
          <p className={styles.contactRow}>{customer.phone}</p>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Status and tags</p>
        <div className={styles.tags}>
          <span
            className={`${styles.badge} ${customer.status === "active" ? styles.badgeActive : styles.badgeInactive}`}
          >
            {customer.status}
          </span>
          {customer.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Notes</p>
        {customer.notes ? (
          <p className={styles.notes}>{customer.notes}</p>
        ) : (
          <p className={styles.notesEmpty}>No notes yet.</p>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Customer since</p>
        <p className={styles.contactRow}>{customer.createdAt}</p>
      </div>
    </>
  );
}
```

`CustomerEditForm` owns all of its own state and logic. It receives `customer` (to pre-fill the form), `onUpdate` (to send the PATCH request), and `onDone` (a callback to hand control back to `CustomerDetail` once the save or cancel is complete):

```jsx
function CustomerEditForm({ customer, onUpdate, onDone }) {
  const [editForm, setEditForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone || "",
    company: customer.company || "",
    notes: customer.notes || "",
    status: customer.status,
    tags: customer.tags,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(customer.id, editForm);
      onDone(editForm);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className={styles.name}>Edit customer</h2>

      <div className={styles.section}>
        <div className={styles.editField}>
          <label className={styles.sectionLabel} htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            className={styles.input}
            value={editForm.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.editField}>
          <label className={styles.sectionLabel} htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            className={styles.input}
            value={editForm.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.editField}>
          <label className={styles.sectionLabel} htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            value={editForm.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.editField}>
          <label className={styles.sectionLabel} htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            className={styles.input}
            value={editForm.phone}
            onChange={handleChange}
          />
        </div>
        <div className={styles.editField}>
          <label className={styles.sectionLabel} htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            className={styles.input}
            value={editForm.company}
            onChange={handleChange}
          />
        </div>
        <div className={styles.editField}>
          <label className={styles.sectionLabel} htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            className={styles.input}
            value={editForm.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div className={styles.editField}>
          <label className={styles.sectionLabel} htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className={styles.input}
            value={editForm.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className={styles.editActions}>
        <button type="submit" className={styles.saveButton} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className={styles.cancelButton} onClick={() => onDone(null)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
```

> **What is `onDone`?** It is the single exit point for `CustomerEditForm`. On a successful save, it is called with the updated field values so `CustomerDetail` can apply them to its own `customer` state. On cancel, it is called with `null` so `CustomerDetail` knows to skip the update. This keeps all the form logic inside `CustomerEditForm` while still letting `CustomerDetail` react to the outcome.

### Step B: Update CustomerDetail to use the new components

With the two sub-components defined, `CustomerDetail` only needs to manage `isEditing` and handle the `onDone` callback. Replace the three pieces of state and three handlers added in Step 2 with just these:

```jsx
const [isEditing, setIsEditing] = useState(false);

const handleEditClick = () => setIsEditing(true);

const handleDone = (updates) => {
  if (updates) {
    setCustomer((prev) => ({ ...prev, ...updates }));
  }
  setIsEditing(false);
};
```

> **Why does `CustomerDetail` update its own `customer` state after a successful save?** `App` updates the `customers` array (so the card in the list reflects the change), but `CustomerDetail` fetched its own copy of the customer independently. Without `setCustomer((prev) => ({ ...prev, ...updates }))`, the detail panel would revert to the old values until the user clicked away and back again.

Then replace the final `return` block with the compact version:

```jsx
return (
  <div className={styles.panel}>
    {isEditing ? (
      <CustomerEditForm
        customer={customer}
        onUpdate={onUpdate}
        onDone={handleDone}
      />
    ) : (
      <CustomerView
        customer={customer}
        onEditClick={handleEditClick}
      />
    )}
  </div>
);
```

The ternary is now easy to read at a glance, and each branch is a self-contained component with a clear responsibility.

---

## Activity: Status Filter (optional, 20 minutes)

You have fetched, added, and deleted customers via the API. Now apply what you know about `filter()` and derived state to add a status filter; no API calls needed for this one.

**Task:** Add a row of filter buttons above the customer list: "All", "Active", and "Inactive". Clicking a button filters the displayed cards by status. The active button should appear visually distinct. Show the count of displayed results.

**Hints:**
1. Add `const [statusFilter, setStatusFilter] = useState("all")` to `App`
2. Extend the existing `filteredCustomers` derivation to also filter by status when `statusFilter` is not `"all"`
3. Render three `<button>` elements above the customer list; wire each to `setStatusFilter`
4. Apply a different class to the active button using a ternary on `statusFilter === "all"` etc.

<details>
<summary>Reference solution</summary>

Add the state to `App.jsx`:

```jsx
const [statusFilter, setStatusFilter] = useState("all");
```

Extend the derived list (replace the existing `filteredCustomers`):

```jsx
const filteredCustomers = customers
  .filter((c) => c.firstName.toLowerCase().includes(searchTerm.toLowerCase()))
  .filter((c) => statusFilter === "all" || c.status === statusFilter);
```

Add the filter buttons and styles to the return, just above the `<div className="customer-list">`:

```jsx
<div className="filter-bar">
  {["all", "active", "inactive"].map((f) => (
    <button
      key={f}
      className={`filter-btn${statusFilter === f ? " filter-btn-active" : ""}`}
      onClick={() => setStatusFilter(f)}
    >
      {f.charAt(0).toUpperCase() + f.slice(1)}
    </button>
  ))}
</div>
```

Add the styles to `App.css`:

```css
.filter-bar {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.filter-btn {
  padding: var(--space-1) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: var(--surface-card);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-body);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.filter-btn-active {
  background: var(--primary-100);
  border-color: var(--primary-500);
  color: var(--primary-700);
  font-weight: var(--weight-medium);
}
```

</details>

---

## The Complete Files

Reference copies of the two files you have modified most heavily in this lesson are provided in the lesson assets. Use them to check your work or recover if you get stuck.

- [`assets/App.jsx`](assets/App.jsx): the finished `src/App.jsx`
- [`assets/CustomerDetail.jsx`](assets/CustomerDetail.jsx): the finished `src/components/CustomerDetail.jsx`

---

## Bonus Challenges

Work on as many as you can; they are listed in order of difficulty.

### Challenge 1: Empty State

When no customers match the current filter, show a contextual message: "No active customers." or "No inactive customers." rather than the generic fallback. When the list is completely empty (no data at all), show "No customers yet. Add one above!"

**Hint:** Nest ternaries: check `customers.length === 0` first, then check `statusFilter` to choose the right message.

---

### Challenge 2: Per-Card Delete Loading State

Right now a customer card disappears as soon as the request completes, but the Delete button gives no feedback while the request is in-flight. Add a loading state so the button shows "Deleting..." and is disabled to prevent double-clicks.

**Hints:**
- Add a `deletingId` state (e.g., `null` when idle, or the customer's `id` while the request is running) to `App`
- Pass it down to `CustomerCard` as a prop and compare `deletingId === customer.id` to set the button label and `disabled` prop
- Set `deletingId` back to `null` in the `finally` block

---

### Challenge 3: Sort Controls

Add buttons to sort by first name or last name (A to Z). Clicking the active sort button a second time reverses the order (Z to A).

**Hints:**
- Add `sortField` and `sortDirection` state to `App`
- Compute `sortedCustomers` from `filteredCustomers` using `[...filteredCustomers].sort(...)`; spread first, as `sort()` mutates in place
- Use `String.localeCompare()` for alphabetic sorting; flip the comparison when `sortDirection === "desc"`

---

### Challenge 4: Tag Editing

The edit form in `CustomerDetail` does not currently allow changing tags. Add tag toggle buttons to the edit form, matching the style used in the Add Customer form.

**Hints:**
- `editForm.tags` is already part of the edit form state
- Add a `handleTagToggle` inside `CustomerDetail` that spreads `editForm` and updates `tags` the same way `App` does for the add form
- Render the tag buttons inside the edit form section

---

## Summary

- **`map()` for lists:** transform an array of data into an array of JSX elements; always provide a stable `key` from the database ID
- **`useEffect` for side effects:** fetching data happens inside `useEffect`, not in the render function; the dependency array controls when the effect re-runs
- **`useEffect` dependency patterns:** `[]` runs once on mount; `[value]` re-runs whenever `value` changes, as used in `CustomerDetail` to re-fetch when the selected customer changes
- **Async inside `useEffect`:** define an async arrow function inside the callback and call it; never make the `useEffect` callback itself `async`
- **Loading and error states:** always handle all three outcomes (loading, error, and data); components can own their own async state independently of their parent
- **Full CRUD over HTTP:** GET all on mount, GET one on selection, POST to create, PATCH to update, DELETE to remove; always update local state from the server response, not from your own constructed object
