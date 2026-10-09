# Book flow handoff

This feature contains Search, Book Details, reserve confirmation, My Reservations and cancellation. Catalogue seed contains 20 books. ISBNs not supplied in the original data are displayed as "Not recorded".

## File map
- library-frontend/src/app/books/index.tsx: search, availability filter and result states.
- library-frontend/src/app/books/[id].tsx: selected book details and confirmation.
- library-frontend/src/app/books/reservations.tsx: owned reservations and cancellation.
- library-frontend/src/components/books/: reusable card, pickup form and styles.
- library-frontend/src/hooks/use-books.ts: catalogue loading and refresh on focus.
- library-frontend/src/services/books-api.ts: API requests and authentication adapter.
- library-frontend/src/types/book.ts: shared frontend types.
- library-backend/models/Book.js: inventory and embedded reservations.
- library-backend/controllers/: request handling; routes/: endpoint mapping.
- library-backend/services/: seed, public data and pickup validation.
- library-backend/config/database.js: database connection.
- library-backend/middleware/requireAuth.js: verified user identity.
- library-backend/data/books.json: 20-book seed. Existing stock and holds are never reset.

## Run
From library-backend, copy .env.example to .env only if no .env exists. Set MONGODB_URI, then run `npm.cmd start`. The API starts after MongoDB connects and seeds the catalogue. No credentials were copied from the previous project.

From library-frontend, run `npm.cmd run web` or `npm.cmd start`. Open "Search library books" on Home, or /books in the browser. For a physical phone set EXPO_PUBLIC_API_URL to the computer's LAN IP with port 5000 and /api. Restart Expo after changing environment variables.

## Book catalogue API

All endpoints are under `/api/books`. `GET /` lists books, and `GET /:id` returns one. Signed-in sessions can manage catalogue entries: `POST /` creates a book, `PATCH /:id` updates supplied fields, and `DELETE /:id` removes a book only when it has no active reservations. Send the session as `Authorization: Bearer <token>`. Create requires `title`, `author`, and non-negative integer `copies`; editable fields are `title`, `author`, `isbn`, `category`, `description`, `color`, `cover`, and `copies`.

Root tsconfig now delegates to the frontend config. Expo app.json is also present inside library-frontend, alongside its assets and package.json. The starter root navigation is a Stack so book pages are reachable on native and web; teammate profile and notifications files are retained.

## Auth teammate integration (required for real reservations)
The repo currently has no login implementation. After login call `setBookSessionToken(accessToken)` from services/books-api.ts; call it with null on logout. Use HS256 JWTs with string `sub` containing the user ID and an `exp` expiry, signed with the backend JWT_SECRET. Keep JWT_SECRET backend-only. If the team's token contract differs, adapt requireAuth.js. No client-supplied user ID is trusted. Until auth is connected, browsing works, and reservations show a sign-in/configuration error rather than creating anonymous holds.

## Endpoints
GET /api/books?q=term; GET /api/books/:id; authenticated GET/POST/PATCH /api/reservations; authenticated DELETE /api/reservations/:id.
POST body: { bookId, pickupDate: "YYYY-MM-DD", pickupWindow: "9-11 AM" | "12-2 PM" | "4-6 PM" }.
PATCH /api/reservations/:id body: { pickupDate, pickupWindow }. It changes the signed-in user's pickup date and time for that reservation; dates use Asia/Colombo, today through seven days ahead. Inventory decrements and insertion share one atomic document update; update and cancellation check reservation ownership, and cancellation restores one copy once.

## Checks
Backend: npm.cmd test. Frontend: npx.cmd tsc --noEmit and npm.cmd run lint.
Navigation follows https://docs.expo.dev/versions/v57.0.0/sdk/router/ .
