# Still waitlist contract

## User-facing promise

The launch page offers a clearly labeled **prototype waitlist** interaction. It demonstrates validation and confirmation without joining a real list.

## Data behavior

- The email value exists only in the page component's in-memory state while the visitor types.
- An incomplete address produces a local validation message.
- A syntactically complete address produces the message: “Demo complete — nothing was saved or sent.”
- The value is cleared immediately after the successful demo interaction.
- No request is sent. There is no API route, form action, database, email system, analytics integration, cookie, `localStorage`, or `sessionStorage` use.
- Refreshing or leaving the page discards any value still being typed.

## Non-promises

This interaction does not reserve access, establish queue position, create an account, subscribe a person to updates, or indicate product demand. No real customer data should be entered because no real service exists.

## Verification

`npm test` exercises invalid and valid input, asserts that the successful value is cleared, and asserts that `fetch` is never called.
