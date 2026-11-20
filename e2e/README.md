# Requisites browser regression test

Run `npx playwright install chromium` once, then `npm run test:e2e`.

Playwright starts an isolated Vite fixture with the production `PaymentDetailsPageContent`,
TipTap editor, theme, Apollo client and dnd-kit components. It uses actual mouse input
on the drag handle, checks that dragging an inactive tab does not select it, saves,
and reloads the page to read the saved order through GraphQL again.

Only the GraphQL endpoint is intercepted. The test checks the exact mutation payload
and keeps the response state across reloads. It does not require login or a database,
and does not test backend persistence itself. It never modifies local or shared data.
