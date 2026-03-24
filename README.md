# PodoCarePRO

Podiatry clinic management system — Spring Boot backend + React frontend.

## Deployment and first run

1. Install Docker.
2. Clone the repository.
3. Create a `.env` file in the project root with the following content:
   ```env
   POSTGRES_PASSWORD=
   JWT_SECRET=        # generate with: openssl rand -base64 64
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```
4. Run the app:
   ```bash
   ./update.sh
   ```
5. Open `http://localhost` in your browser.
6. Log in with default credentials: `admin` / `Admin123` and change the password.

**APP is working!**

## Notes

- PostgreSQL is available on host port `5433` for database management tools (DBeaver, pgAdmin).
- Access is intended via **Tailscale VPN** — install Tailscale on the server and all client devices, enable MagicDNS for a friendly hostname (e.g. `http://podocare`).
- CORS allowed origins are configured via `CORS_ALLOWED_ORIGINS` in `.env`.
