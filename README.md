# 2.5 Lists, Asynchronous Programming, and Side Effects

## Lesson Overview

This lesson replaces the CRM app's hardcoded customer data with live API calls. Learners are introduced to the component lifecycle and the `useEffect` hook, then connect the app to a local API server using `fetch` with `async/await`. The lesson covers list rendering with `map()` and the `key` prop, loading and error state management, and full CRUD over HTTP: GET all on mount, GET one on selection, POST to create, PATCH to update, and DELETE to remove records.

## Dependencies

- [Self Studies](./studies.md)
- [Lesson](./lesson.md)
- [Assignment](./assignment.md)

## Lesson Objectives

- Render dynamic lists from API data using `map()` and the `key` prop
- Use `useEffect` to fetch data on component mount and re-fetch when a dependency changes; handle loading and error states during asynchronous operations
- Perform GET, POST, PATCH, and DELETE requests to read, create, update, and remove customer records via a REST API

## Lesson Plan

| Duration  | What                                            | How or Why                                                                                                     |
| --------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 10 min    | Warm up and recap                               | Recap Lesson 2.3: lifting state and conditional rendering; introduce today's shift from hardcoded to live data |
| 7 min     | Rendering lists: map(), key prop, and filtering | Slides: transforming arrays to JSX, why key matters for reconciliation, derived filtering without extra state  |
| 7 min     | Component lifecycle and useEffect               | Slides: what happens each render, when side effects run, the three dependency array patterns                   |
| 6 min     | Async/await with useEffect and fetch            | Slides: GET request pattern, loading and error states, POST and DELETE request structure                       |
| 35 min    | Code-along: connecting to the backend           | Replace hardcoded data with a GET fetch on mount; add loading spinner and error message to the customer list   |
| 5 min     | Break                                           |                                                                                                                |
| 22 min    | Code-along: adding customers via POST           | Wire the add-customer form to send a POST request and update state from the server response                    |
| 5 min     | Break                                           |                                                                                                                |
| 15 min    | Code-along: deleting customers via DELETE       | Send a DELETE request on remove; confirm deletion via response before updating state                           |
| 20 min    | Code-along: fetching a single customer          | Rewrite CustomerDetail to fetch GET /customers/:id; introduce useEffect with a dependency                      |
| 20 min    | Activity: status filter (optional)              | Learners add filter buttons and derived filtering independently                                                |
| 5 min     | Wrap up and Q&A                                 | Recap learning objectives, address common pitfalls, preview Lesson 2.6                                         |
| **Total** |                                                 | **157 min core + 20 min optional activity = 177 min. Optional PATCH adds ~35 min; optional refactor a further ~25 min.** |
