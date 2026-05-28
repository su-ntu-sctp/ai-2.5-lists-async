# Assessment / Quiz

## Overview

- **Lesson:** Lists, Asynchronous Programming, and Side Effects / 2.5
- **Format:** 10 questions (mix MCQ / True–False)
- **Time:** ~10–15 minutes
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
