# Pre-Reading: Lesson 2.5, Lists, Asynchronous Programming, and Side Effects

Timebox **2–3 hours** across these resources before the lesson. You do not need to memorise everything; focus on building a mental model so the hands-on lab clicks faster.

---

## 1. Rendering Lists with map()

**Read (15 min)**

- [Rendering Lists](https://react.dev/learn/rendering-lists): Covers how to transform an array of data into an array of JSX elements with `map()`, and why each element needs a stable `key`.

**Key idea to take away:** The `key` prop is not for styling or logic; it helps React match array items across renders. Always use a stable, unique value from the data itself (such as a database ID), never the array index.

---

## 2. Synchronizing with Effects

**Read (25 min)**

- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects): Introduces `useEffect` and explains why some code needs to run "outside" the normal render flow, such as fetching data or subscribing to an external system.

**Key idea to take away:** A component function must stay pure; it describes what the UI should look like, not what should happen. Side effects, like fetching data, belong in `useEffect`, not in the body of the component.

---

## 3. Controlling When Effects Run

**Read (15 min)**

- [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects): Focus on the sections about the dependency array. Pay attention to the difference between an empty array `[]` and an array containing a value.

**Quick check:** After reading, can you explain the difference between these two effects?

```jsx
useEffect(() => {
  fetchData();
}, []);

useEffect(() => {
  fetchData();
}, [selectedId]);
```

---

## 4. Fetching Data with fetch()

**Watch (15 min)**

- [JavaScript fetch API](https://www.youtube.com/watch?v=37vxWr0WgQk): A short walkthrough of the `fetch()` API, including how to read a JSON response body and check `response.ok`.

**Key ideas:**

- `fetch()` only rejects its promise on a network failure; a 404 or 500 response still resolves successfully, so always check `response.ok`.
- `await response.json()` parses the response body; this step is itself asynchronous.

---

## 5. Async Functions and try / catch

**Read (15 min)**

- [Using async and await](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises): Skip ahead to the "async/await" section if you are already comfortable with promises. Focus on how `try / catch / finally` is used to handle failures.

---

## Reflection (10 min)

Before the lesson, write down answers to these three questions (a notebook or a text file is fine):

1. Why does calling an async data-fetching function directly in the body of a component cause an infinite loop, while calling it inside `useEffect(() => {...}, [])` does not?
2. When would you want a `useEffect` to depend on a specific value, such as `[selectedId]`, rather than running once on mount with `[]`?
3. What is one thing you are still unclear about after the pre-reading?
