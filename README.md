# Library Reservation App

A full-stack library reservation system for managing books, categories, users, reservations, seats, announcements, and admin reports.

## Tech stack

- Frontend: Expo + React Native + Expo Router + TypeScript
- Backend: Node.js + Express 5 + Mongoose + JWT
- Database: MongoDB (MongoDB Atlas or local MongoDB)

## Folder structure

- `library-frontend/` — Expo app with admin dashboard and mobile UI
- `library-backend/` — Express API, models, routes, and seed scripts
- `README.md` — project setup and team workflow

## Backend setup

```bash
cd library-backend
npm install
cp .env.example .env
npm run seed
npm start
```

Update `MONGODB_URI`, `PORT`, and `JWT_SECRET` in the generated `.env` file before running the API.

## Frontend setup

```bash
cd library-frontend
npm install
cp .env.example .env
npx expo start
```

Set `EXPO_PUBLIC_API_HOST` in `.env` to your PC's WiFi IPv4 when running the app on Expo Go from a phone.

## Open the admin panel

- Web: open `/admin-panel` in the browser
- Expo Go: use `exp://<IP>:8081/--/admin-panel` with your machine's LAN IP

## Demo credentials

- Email: `admin@library.com`
- Password: `Admin@123`

## Git branching rules

- Create feature branches from `main` using a short, descriptive name such as `feature/admin-dashboard`.
- Keep changes focused to the admin module or the assigned feature area.
- Open a pull request before merging and include a summary of what changed and how it was validated.

## Troubleshooting

- If MongoDB Atlas rejects connections, update the IP whitelist to include your current public IP.
- If the mobile app cannot reach the backend, confirm both devices are on the same WiFi network.
- If the backend is unreachable on a phone, ensure port `5000` is open and the backend process is running.
- If Expo cannot connect, confirm the API host matches your PC's WiFi IPv4 and restart the dev server.
