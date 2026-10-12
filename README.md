# Library Book Reservation & Reading Room Seat Booking App

**IT3060 - Human Computer Interaction | Milestone 03 | Group WE_51**

Sri Lanka Institute of Information Technology (SLIIT), Faculty of Computing

A mobile application that lets university students and staff search and reserve library books, book reading-room seats with QR check-in, receive automated notifications and manage their account, and lets library staff manage reservations and view usage analytics. This repository is the working implementation of the high-fidelity Figma prototype from Milestone 02, built from the requirements elucidated in Milestone 01.

---

## 1. Team and Responsibilities

| Student ID | Name | Feature Area | Requirements |
|---|---|---|---|
| IT23616738 | Ranasingha R.A.S.H | Book Search & Reservation | FR-01, FR-02 |
| IT23615984 | Peiris L.I.U | Seat Booking & QR Check-in | FR-03, FR-05 |
| IT23620216 | Dilshan D.M.C | Notifications & Account Management | FR-04 |
| IT23615120 | Mavindi M.B | Admin Dashboard & Reports | FR-06 |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Mobile frontend | React Native (Expo SDK 57), Expo Router (file-based routing), TypeScript |
| Backend | Node.js, Express.js (REST API) |
| Database | MongoDB Atlas (cloud), accessed through Mongoose |
| Authentication | JSON Web Tokens (jsonwebtoken), bcryptjs password hashing |
| Version control | Git and GitHub (feature branches, Pull Requests) |

### Architecture

```
React Native app (Expo)  --HTTP/JSON-->  Express REST API  --Mongoose-->  MongoDB Atlas
   library-frontend                        library-backend                 (cloud database)
```

The app sends requests to the API with an `Authorization: Bearer <token>` header. The API verifies the JWT, runs the operation through Mongoose and returns JSON.

---

## 3. Repository Structure

```
IT3060-HCI-Milestone03-WE51-Library-Reservation-App/
|-- library-frontend/                Expo (React Native) mobile app
|   |-- src/
|   |   |-- app/                     Expo Router screens
|   |   |   |-- (auth)/              Login, Register, Forgot Password
|   |   |   |-- (tabs)/
|   |   |   |   |-- notifications/   Notifications flow
|   |   |   |   |-- profile/         Profile, Edit, Settings, Help, Contact
|   |   |   |-- books/               Book search and reservation screens
|   |   |   |-- seats/               Seat booking and QR check-in screens
|   |   |   |-- admin/               Staff / admin screens
|   |   |-- components/              Shared UI components
|   |   |-- constants/               Theme and test auth constants
|   |   |-- features/                Feature types and mock data
|   |   |-- services/api.ts          API client used by the screens
|   |-- package.json
|-- library-backend/                 Node.js + Express REST API
|   |-- models/                      Mongoose models
|   |-- routes/                      Express route files
|   |-- middleware/auth.js           JWT verification middleware
|   |-- seed.js                      Sample data script
|   |-- server.js                    Entry point
|   |-- package.json
|-- README.md
```

---

## 4. Prerequisites

- Node.js v20.19.4 or newer (LTS) and npm — https://nodejs.org
- Git — https://git-scm.com
- Expo Go app on a phone (Android: Play Store, iOS: App Store), or a web browser to run on localhost
- The MongoDB Atlas connection string for the group's cluster. It is shared privately by the team and is **not** stored in this repository.

---

## 5. Setup and Run

### 5.1 Clone the repository

```bash
git clone https://github.com/chamika217/IT3060-HCI-Milestone03-WE51-Library-Reservation-App.git
cd IT3060-HCI-Milestone03-WE51-Library-Reservation-App
```

### 5.2 Backend

```bash
cd library-backend
npm install
```

Create a file called `.env` inside `library-backend/`. It is git-ignored and must never be committed.

```
MONGODB_URI=<MongoDB Atlas connection string, shared privately by the team>
PORT=5000
JWT_SECRET=<any long random string>
```

Connection string format:
`mongodb+srv://<username>:<password>@<cluster>.mongodb.net/libraryDB?retryWrites=true&w=majority`

Load the sample data. This clears and recreates the seeded collections, so run it only when you want a fresh dataset:

```bash
node seed.js
```

The script prints the test user's id and credentials. Start the API:

```bash
node server.js
```

Expected output: `Server running on port 5000` and `MongoDB connected successfully`.

Opening http://localhost:5000 should show "Library Reservation API is running".

### 5.3 Frontend (use a second terminal)

```bash
cd library-frontend
npm install
npx expo start
```

- Press `w` to open the app in a browser (http://localhost:8081), or
- scan the QR code with Expo Go (phone and laptop must be on the same Wi-Fi network).

If the app shows stale screens, clear the cache with `npx expo start -c`.

### 5.4 Using a physical phone

`localhost` on a phone does not point to the laptop. In `library-frontend/src/services/api.ts` set `DEV_MACHINE_IP` to the laptop's local IP address:

```ts
const DEV_MACHINE_IP = '192.168.x.x'; // replace with your laptop's LAN IP
```

Find the IP with `ipconfig` (Windows) or `ifconfig` (macOS/Linux). Both devices must be on the same network. The `API_BASE_URL` already switches automatically between `localhost` (web) and the LAN IP (native device).

### 5.5 Test account

| Field | Value |
|---|---|
| Email | ashan.s@university.edu.lk |
| Password | Password123! |
| Student ID | 204918 |

The frontend auto-logs in on first request using `initAuth()` in `api.ts` — no manual token update needed. `initAuth()` calls `POST /api/auth/login` with the credentials from `constants/testAuth.ts`, caches the token and userId, and reuses them for all subsequent API calls. Tokens expire after 7 days; `initAuth()` will re-login automatically on the next app start.

---

## 6. Features by Member

### 6.1 Book Search & Reservation — Ranasingha R.A.S.H (FR-01, FR-02)

| Item | Details |
|---|---|
| Screens | Onboarding, Login, Register, Forgot Password, Home Dashboard, Search Books, Search Results, Book Details, Reserve Book Confirmation, My Reservations **[to complete]** |
| Models | **[to complete]** (e.g. Book, Reservation) |
| API endpoints | **[to complete]** (e.g. GET /api/books, GET /api/books/:id, POST /api/reservations, PUT /api/reservations/:id, DELETE /api/reservations/:id) |
| CRUD operations | **[to complete]** (Create / Read / Update / Delete per screen) |

### 6.2 Seat Booking & QR Check-in — Peiris L.I.U (FR-03, FR-05)

| Item | Details |
|---|---|
| Screens | Reading Room, Seat Layout, Book Seat, My Seat Bookings, QR Check-in **[to complete]** |
| Models | **[to complete]** (e.g. Seat, SeatBooking) |
| API endpoints | **[to complete]** (e.g. GET /api/seats, POST /api/seat-bookings, PUT /api/seat-bookings/:id/check-in, DELETE /api/seat-bookings/:id) |
| CRUD operations | **[to complete]** |

### 6.3 Notifications & Account Management — Dilshan D.M.C (FR-04)

| Item | Details |
|---|---|
| Screens | Notifications List, Notification Detail, Notification Preferences, Allow Notifications (permission), Profile, Edit Profile, Settings, Help & Support, Contact Library Staff |
| Models | User, Notification, ContactMessage, FaqFeedback |
| Authentication | Register and login with bcrypt-hashed passwords, JWT issued on login, `middleware/auth.js` protects all routes |

#### API Endpoints

| Method | Endpoint | Purpose | CRUD |
|---|---|---|---|
| POST | /api/auth/register | Create an account | Create |
| POST | /api/auth/login | Log in and receive a JWT | — |
| GET | /api/users/:id | Read profile | Read |
| PUT | /api/users/:id | Update name, email, phone | Update |
| PUT | /api/users/:id/preferences | Update notification preferences | Update |
| PUT | /api/users/:id/password | Change password | Update |
| GET | /api/notifications/:userId | List notifications (filterable by type) | Read |
| GET | /api/notifications/detail/:id | Notification detail | Read |
| POST | /api/notifications | Create a notification | Create |
| PUT | /api/notifications/:id/read | Mark one as read | Update |
| PUT | /api/notifications/:id/unread | Mark one as unread | Update |
| PUT | /api/notifications/:userId/read-all | Mark all as read | Update |
| DELETE | /api/notifications/:id | Delete a notification | Delete |
| POST | /api/contact | Send a message to library staff | Create |
| GET | /api/contact/:userId | List a user's past messages | Read |
| DELETE | /api/contact/:id | Delete a past message | Delete |
| POST | /api/faq | Submit FAQ helpful/not-helpful feedback | Create |
| GET | /api/faq/:userId | Get user's FAQ feedback entries | Read |
| DELETE | /api/faq/:id | Remove a feedback entry (undo) | Delete |

#### CRUD Coverage per Screen

| Screen | Create | Read | Update | Delete |
|---|---|---|---|---|
| Notifications List | — | ✅ Fetch all | ✅ Mark read/unread, Mark all read | ✅ Long-press → delete with undo toast |
| Notification Detail | — | ✅ Fetch single | ✅ Mark as unread | ✅ Delete with confirmation |
| Notification Preferences | — | ✅ Load prefs | ✅ Toggle each preference | — |
| Allow Notifications | — | — | — | — *(device-level OS permission only)* |
| Profile | — | ✅ Load profile & stats | — | — |
| Edit Profile | — | ✅ Load into form | ✅ Save name/phone | — |
| Settings | — | ✅ Load prefs | ✅ Toggle push/holds/seats | — |
| Help & Support | ✅ Submit FAQ feedback | ✅ Load existing ratings | ✅ Change vote | ✅ Undo rating |
| Contact Library Staff | ✅ Send message | ✅ Previous messages list | — | ✅ Delete past message |

### 6.4 Admin Dashboard & Reports — Mavindi M.B (FR-06)

| Item | Details |
|---|---|
| Screens | Staff Dashboard, Manage Reservations, Manage Seats, Reports & Statistics **[to complete]** |
| Models | **[to complete]** |
| API endpoints | **[to complete]** (e.g. GET /api/admin/stats, GET /api/admin/reservations, PUT /api/admin/reservations/:id, PUT /api/admin/seats/:id) |
| CRUD operations | **[to complete]** |

---

## 7. Git Workflow

- Each member works on their own branch and does not push directly to `main`.
- Branches: `feature/book-flow`, `feature/seat-booking`, `feature/notifications-profile`, `feature/admin-dashboard`.
- A finished feature is merged into `testing` for integration, then into `main` through a Pull Request.
- Shared files (`server.js`, `app-tabs.tsx`, `api.ts`, `types.ts`) are the usual source of merge conflicts and are resolved during the merge.

---

## 8. Known Limitations

- The frontend uses a temporary test account (`constants/testAuth.ts`) until the login screen is wired to `/api/auth/login` across the whole app. Running `node seed.js` recreates the test user; the app auto-logs in dynamically so no manual token update is needed.
- Icons use a lightweight glyph shim (`IonIcon.tsx`) that can be swapped for `@expo/vector-icons` once `npx expo install @expo/vector-icons` succeeds on the network.
- Push notification delivery requires `expo-notifications` and a development build. The Allow Notifications screen requests the OS-level permission only and does not call the backend.
- The `accepts@2.0.0` package introduced by another feature branch conflicts with Metro's bundler on Windows. Workaround: manually extract `negotiator@0.6.3` into `node_modules/negotiator/` after running `npm install`.
- **[each member: add your own known limitations here]**

---

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| `bad auth : Authentication failed` | Username or password in `MONGODB_URI` is wrong. Check Database Access in Atlas. |
| `Could not connect to any servers` | In Atlas Network Access allow your IP (0.0.0.0/0 for development), check the cluster is not paused, or try another network (some campus networks block port 27017). |
| `Cannot POST /api/auth/login` | The route is not registered in `server.js`. Pull the latest code and restart the server. |
| `No token provided` | Send the header `Authorization: Bearer <token>`. |
| `npm install` fails with `ECONNRESET` | Unstable network. Retry or use a mobile hotspot. |
| `Cannot find module 'negotiator'` | Run: `mkdir node_modules\negotiator && cd node_modules\negotiator && npm pack negotiator@0.6.3 --prefer-offline && tar -xzf negotiator-0.6.3.tgz --strip-components=1 && del negotiator-0.6.3.tgz` |
| App shows old screens | Run `npx expo start -c`. |
| App on phone cannot reach the API | Update `DEV_MACHINE_IP` in `api.ts` to the laptop's LAN IP (section 5.4). |
| `OverwriteModelError: Cannot overwrite model` | Another team's model file has a duplicate `mongoose.model()` call. Change the last line to `module.exports = mongoose.models.ModelName \|\| mongoose.model('ModelName', schema)`. |
| `TLS certificate` error on `npx expo login` | Run `$env:NODE_TLS_REJECT_UNAUTHORIZED="0" ; npx expo login` in PowerShell. |
