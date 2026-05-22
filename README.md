# 2.5 Lists, Asynchronous Programming, and Side Effects

## Lesson Overview

This lesson replaces the CRM app's hardcoded customer data with live API calls. Learners are introduced to the component lifecycle and the `useEffect` hook, then connect the app to a local API server using `fetch` with `async/await`. The lesson covers list rendering with `map()` and the `key` prop, loading and error state management, and sending POST and DELETE requests so that changes persist across page reloads.

## Dependencies

- [Self Studies](./studies.md)
- [Lesson](./lesson.md)
- [Assignment](./assignment.md)

## Lesson Objectives

- Render dynamic lists from API data using `map()` and the `key` prop
- Use `useEffect` to fetch data on component mount and handle loading and error states during asynchronous operations
- Perform POST and DELETE requests to create and remove customer records via a REST API

## Lesson Plan

| Duration  | What                                            | How or Why                                                                                                     |
| --------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 10 min    | Warm up and recap                               | Recap Lesson 2.3: lifting state and conditional rendering; introduce today's shift from hardcoded to live data |
| 15 min    | Rendering lists: map(), key prop, and filtering | Slides: transforming arrays to JSX, why key matters for reconciliation, derived filtering without extra state  |
| 15 min    | Component lifecycle and useEffect               | Slides: what happens each render, when side effects run, the three dependency array patterns                   |
| 20 min    | Async/await with useEffect and fetch            | Slides: GET request pattern, loading and error states, POST and DELETE request structure                       |
| 5 min     | Break                                           |                                                                                                                |
| 30 min    | Code-along: connecting to the backend           | Replace hardcoded data with a GET fetch on mount; add loading spinner and error message to the customer list   |
| 25 min    | Code-along: adding customers via POST           | Wire the add-customer form to send a POST request and update state from the server response                    |
| 5 min     | Break                                           |                                                                                                                |
| 20 min    | Code-along: deleting customers via DELETE       | Send a DELETE request on remove; confirm deletion via response before updating state                           |
| 15 min    | Wrap up and Q&A                                 | Recap learning objectives, address common pitfalls (stale closures, double fetch in dev), preview Lesson 2.6  |
| **Total** |                                                 | **160 min — allows ~20 min buffer for questions and pacing**                                                   |
