# Assessment / Quiz

## Overview

- **Lesson:** Lists, Asynchronous Programming, and Side Effects / 2.5
- **Format:** 30 questions (mix MCQ / True–False)
- **Time:** ~30 minutes
- **Scoring:** 1 point each (unless stated)

## Questions

### Q1 (True/False)

The `map()` method returns a new array and does not modify the original.

A - True

B - False

---

### Q2

Which of the following correctly renders a list of customer names from an array?

A - `{customers.forEach(c => <p>{c.firstName}</p>)}`

B - `{customers.map(c => <p>{c.firstName}</p>)}`

C - `{customers.filter(c => <p>{c.firstName}</p>)}`

D - `{customers.find(c => <p>{c.firstName}</p>)}`

---

### Q3

In the CRM app, customers are fetched from an API and each has a unique `id` field. Which `key` prop is correct?

A - `<CustomerCard key={Math.random()} customer={c} />`

B - `<CustomerCard key={index} customer={c} />`

C - `<CustomerCard key={c.id} customer={c} />`

D - `<CustomerCard key={c.firstName} customer={c} />`

---

### Q4 (True/False)

Using the array index as the `key` prop is safe when items can be deleted or reordered.

A - True

B - False

---

### Q5

A developer writes `customers.sort((a, b) => a.firstName.localeCompare(b.firstName))` directly on the state array and stores the result. What is wrong with this?

A - `localeCompare` is not a valid string method

B - `sort()` mutates the original array, which would directly modify state

C - `sort()` returns `undefined` instead of the sorted array

D - Nothing is wrong: this is the correct approach

---

### Q6

Which array method would you use to display only customers whose `jobTitle` is not `null`?

A - `map()`

B - `find()`

C - `filter()`

D - `reduce()`

---

### Q7

A search input filters customers by name and email. `filteredCustomers` is computed as follows:

```jsx
const filteredCustomers = customers.filter(c =>
  c.firstName.toLowerCase().includes(searchTerm.toLowerCase())
);
```

Where should this line be written?

A - Inside a `useEffect` with `[searchTerm]` as the dependency

B - Inside a `useState` initialiser

C - Directly in the component function body, during render

D - Inside an event handler

---

### Q8

Every React component goes through three lifecycle phases. What are they in order?

A - Render → Mount → Unmount

B - Mount → Update → Unmount

C - Create → Render → Destroy

D - Initialize → Execute → Cleanup

---

### Q9 (True/False)

A React component function may be called many times during a user session: once on mount and again on every state or prop change.

A - True

B - False

---

### Q10

When does the **Unmount** phase of a component's lifecycle occur?

A - When the component's state is set to `null`

B - When the component is removed from the UI, for example by a conditional rendering it out

C - When the component receives new props

D - When `useEffect` runs its cleanup function

---

### Q11

After React calls a component function and receives the returned JSX, what happens next before `useEffect` runs?

A - React immediately runs any `useEffect` calls

B - React compares the new JSX to the previous output and updates only the parts of the DOM that changed

C - React re-renders all child components unconditionally

D - React pauses rendering and waits for user input

---

### Q12 (True/False)

Code written at the top level of a component function (outside any hook) runs on every render, including every state update.

A - True

B - False

---

### Q13

What is a "side effect" in the context of a React component?

A - A bug caused by incorrect state updates

B - Any operation that reaches outside the component, such as fetching data, setting a timer, or writing to local storage

C - A function that returns JSX with more than one root element

D - A prop that changes the component's internal state

---

### Q14

Why does calling `fetch()` directly in a component's render function cause an infinite loop?

A - `fetch()` is not allowed inside JSX

B - Each `fetch()` call blocks the browser's main thread

C - `fetch()` updates state, which triggers a re-render, which calls `fetch()` again, repeating indefinitely

D - React batches multiple `fetch()` calls into one, causing duplicate responses

---

### Q15

`useEffect` schedules its callback to run at which point in the render cycle?

A - Before the component function is called

B - During the return statement evaluation

C - After React has updated the DOM

D - Before React compares the new JSX to the previous output

---

### Q16

What does the dependency array `[]` passed to `useEffect` mean?

A - The effect has no dependencies and will never run

B - The effect runs after every render

C - The effect runs once, after the component first mounts

D - The effect runs only when the component unmounts

---

### Q17

A component fetches customer details based on a `customerId` prop. Which `useEffect` is correct?

A - `useEffect(() => { fetchCustomer(customerId); });`

B - `useEffect(() => { fetchCustomer(customerId); }, []);`

C - `useEffect(() => { fetchCustomer(customerId); }, [customerId]);`

D - `useEffect(() => { fetchCustomer(customerId); }, [customers]);`

---

### Q18 (True/False)

The cleanup function returned from `useEffect` runs before the next time the effect fires (if dependencies changed) and when the component unmounts.

A - True

B - False

---

### Q19

A developer writes the following. What is the problem?

```jsx
useEffect(async () => {
  const data = await fetchCustomers();
  setCustomers(data);
}, []);
```

A - `async` functions are not valid JavaScript

B - `useEffect` expects nothing or a cleanup function as its return value, but an `async` function always returns a Promise

C - `await` cannot be used inside `useEffect`

D - `setCustomers` must not be called inside `useEffect`

---

### Q20

Which of the following correctly uses `async/await` inside `useEffect`?

A -
```jsx
useEffect(async () => {
  const data = await fetch('/customers').then(r => r.json());
  setCustomers(data);
}, []);
```

B -
```jsx
useEffect(() => {
  async function load() {
    const res = await fetch('/customers');
    const data = await res.json();
    setCustomers(data);
  }
  load();
}, []);
```

C -
```jsx
async useEffect(() => {
  const data = await fetchCustomers();
  setCustomers(data);
}, []);
```

D -
```jsx
useEffect(() => {
  fetchCustomers().await.then(setCustomers);
}, []);
```

---

### Q21

`fetch()` rejects its Promise only when there is a network failure. What additional check is needed to handle HTTP error responses such as 404 or 500?

A - Wrap `fetch()` in a `try` block

B - Check `response.status === 200` before calling `response.json()`

C - Check `response.ok` and throw an error if it is `false`

D - Use `response.text()` instead of `response.json()`

---

### Q22 (True/False)

In a `try / catch / finally` block, the `finally` block runs only when no error is thrown.

A - True

B - False

---

### Q23

When sending a POST request with a JSON body using the Fetch API, which header must be included?

A - `Accept: application/json`

B - `Authorization: Bearer token`

C - `Content-Type: application/json`

D - `X-Requested-With: fetch`

---

### Q24

After successfully creating a new customer via POST, the server returns the created object including its assigned `id`. Why should the component use the server's response to update state rather than the form data it sent?

A - The form data may contain HTML that must be sanitised by the server first

B - The server assigns the `id`; using the form data would leave the new customer without a stable identifier in local state

C - React does not allow objects without a server-assigned `id` to be stored in state

D - The response always contains additional fields that the form does not

---

### Q25

A developer removes a customer from local state immediately when Delete is clicked, before the DELETE request completes. What risk does this introduce?

A - The component will re-render twice unnecessarily

B - If the request fails, the UI shows the customer as deleted while it still exists on the server

C - React will throw an error because `filter()` modifies state directly

D - The `key` prop on the remaining cards will become invalid

---

### Q26 (True/False)

Starting the `loading` state as `true` (rather than `false`) prevents a flash of empty content before the first API response arrives.

A - True

B - False

---

### Q27

A component has `loading`, `error`, and `customers` state. Which rendering order correctly handles all three states?

A -
```jsx
return <CustomerList customers={customers} />;
if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error}</p>;
```

B -
```jsx
if (error) return <p>Error: {error}</p>;
if (loading) return <p>Loading...</p>;
return <CustomerList customers={customers} />;
```

C -
```jsx
if (loading) return <p>Loading...</p>;
return <CustomerList customers={customers} />;
if (error) return <p>Error: {error}</p>;
```

D -
```jsx
return loading ? null : error ? <p>{error}</p> : <CustomerList customers={customers} />;
```

---

### Q28

json-server is used as the API server in this lesson. What happens to data written via a POST or DELETE request when the page is reloaded?

A - All changes are lost because json-server stores data in memory only

B - Changes persist because json-server writes them back to `db.json`

C - Changes persist only until json-server is restarted

D - json-server does not support POST or DELETE requests

---

### Q29

A learner fetches customers on mount and also wants to re-fetch whenever a `filterTag` prop changes. Which implementation is correct?

A -
```jsx
useEffect(() => { fetchCustomers(); }, []);
useEffect(() => { fetchCustomers(); }, [filterTag]);
```

B -
```jsx
useEffect(() => { fetchCustomers(); }, [filterTag]);
```

C -
```jsx
useEffect(() => { fetchCustomers(); });
```

D - Both A and B produce the same number of fetches and are equally correct

---

### Q30

A learner writes the following component. Identify the bug:

```jsx
function CustomerList() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/customers')
      .then(res => res.json())
      .then(data => setCustomers(data));
  });

  return customers.map(c => <CustomerCard key={c.id} customer={c} />);
}
```

A - `useState` cannot be initialised with an empty array

B - The `useEffect` is missing a dependency array, so it runs after every render and causes an infinite fetch loop

C - `fetch` cannot be used inside `useEffect`

D - The `key` prop must be a string, not a number

---
