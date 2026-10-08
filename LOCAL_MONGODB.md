# Local MongoDB development

The backend uses mongodb://127.0.0.1:27017/library_reserve in library-backend/.env. MongoDB runs on this computer as a Windows service; the database does not need Atlas DNS or an internet connection.

Start the backend from library-backend with npm.cmd start. Start Expo from library-frontend with npm.cmd run web or npm.cmd start.

Check MongoDB in PowerShell: Get-Service MongoDB. If stopped, open PowerShell as Administrator and run Start-Service MongoDB.

The previous Atlas settings are saved in library-backend/.env.atlas.local, which is ignored by Git. Never commit either environment file. To restore Atlas later, copy the backup to .env and restart the backend.

This is a separate database. The app seeds its 20 catalogue books automatically; existing Atlas accounts and reservations are not copied. Create a new local account through Sign up.

The database listens only on localhost. A physical phone connects to the backend API, not directly to MongoDB: set library-frontend/.env EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:5000/api and restart Expo. Both devices must be on a network that permits device-to-device traffic. Web on this computer uses http://localhost:5000/api.

Health check: http://localhost:5000/api/health.
