# PodoCarePRO

Podiatry clinic management system — Spring Boot backend + React frontend.

## First-time deployment

1. Install Docker.
2. Clone the repository.
3. Create a `.env` file in the project root:
   ```env
   POSTGRES_PASSWORD=your_strong_password
   JWT_SECRET=        # generate with: openssl rand -base64 64
   CORS_ALLOWED_ORIGINS=https://pro.podocare.com.pl
   ```
4. Run the SSL initialization init-ssl.sh script (only once).

   This will:
   - Generate a Let's Encrypt SSL certificate via Certbot (webroot method)
   - Generate dhparam for stronger HTTPS encryption
   - Start all containers

5. Open `https://pro.podocare.com.pl` in your browser and log in with default credentials: `admin` / `Admin123`. Change the password immediately.

## Updating the app

After pushing new code to the repository, run update.sh script.

## Notes

- SSL certificates are renewed automatically by the Certbot container (checked every 12h).
- PostgreSQL is available on host port `5433` for database management tools (DBeaver, pgAdmin).
- CORS allowed origins are configured via `CORS_ALLOWED_ORIGINS` in `.env`.
- `init-ssl.sh` must be run before `update.sh` on a fresh server.
