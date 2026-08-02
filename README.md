# SMTP Manager

A full-stack app to log in, add sending domains, and manage their DNS records
(A, AAAA, CNAME, TXT, MX, SPF, DKIM, DMARC, NS) plus per-domain SMTP credentials.

- **Backend:** Node.js + Express + PostgreSQL (`server/`)
- **Frontend:** Next.js + Tailwind CSS (`client/`)
- **Auth:** email/password with JWT
- **Security:** SMTP passwords are AES-256 encrypted at rest using `ENCRYPTION_KEY`

No Docker required — everything runs against a local Postgres instance.

## 1. Prerequisites

- Node.js 18+
- A running local PostgreSQL server on `localhost:5432`

## 2. Create the database

```bash
# Using psql, create the role and database that match server/.env
psql -U postgres -c "CREATE USER smtp_admin WITH PASSWORD 'qwerty123';"
psql -U postgres -c "CREATE DATABASE smtp_manager OWNER smtp_admin;"
```

(Skip this step if `smtp_admin` / `smtp_manager` already exist locally.)

## 3. Backend setup

```bash
cd server
npm install
npm run migrate   # creates users, domains, dns_records tables
npm run dev        # starts API on http://localhost:4000
```

`server/.env` is already filled in:

```
DATABASE_URL="postgres://smtp_admin:qwerty123@localhost:5432/smtp_manager"
BACKEND_PORT=4000
JWT_SECRET=change_this_jwt_secret_before_production
ENCRYPTION_KEY=6e9eaa8ee2e1e9cfe0f9cdc7c7fc39e56d0ec7e6371cb6c06e238234f58e6c67
CORS_ORIGIN=http://localhost:5173
```

Change `JWT_SECRET` before using this anywhere beyond local development.

## 4. Frontend setup

In a second terminal:

```bash
cd client
npm install
npm run dev   # starts Next.js on http://localhost:5173
```

`client/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
FRONTEND_PORT=5173
```

## 5. Use it

1. Open http://localhost:5173 → you'll land on the login page.
2. Click "Create one" to register an account.
3. From the dashboard, click **+ Add domain** and enter a domain (e.g. `example.com`).
4. Open the domain to:
   - Add/edit/delete DNS records under the **DNS records** tab (choose type: A, AAAA, CNAME, TXT, MX, SPF, DKIM, DMARC, NS).
   - Configure SMTP host/port/username/password/from-address under the **SMTP settings** tab. The password is encrypted before it's stored.
5. Toggle "Mark as verified" once you've confirmed the DNS records are live (this is a manual flag in this version — see notes below).

## Project structure

```
smtp-app/
├── server/                  # Express API
│   ├── src/
│   │   ├── index.js         # app entry
│   │   ├── db.js            # pg pool
│   │   ├── migrate.js       # applies migrations/001_init.sql
│   │   ├── middleware/auth.js
│   │   ├── routes/auth.js
│   │   ├── routes/domains.js
│   │   └── routes/records.js
│   ├── migrations/001_init.sql
│   └── .env
└── client/                  # Next.js app
    ├── app/
    │   ├── login/page.js
    │   ├── register/page.js
    │   └── dashboard/
    │       ├── page.js                  # domains list
    │       └── domains/[id]/page.js     # records + SMTP settings
    ├── components/
    ├── lib/api.js
    └── .env.local
```

## API overview

| Method | Path                                      | Description                     |
|--------|--------------------------------------------|----------------------------------|
| POST   | /api/auth/register                        | Create an account               |
| POST   | /api/auth/login                           | Log in, returns JWT              |
| GET    | /api/auth/me                              | Current user (auth required)     |
| GET    | /api/domains                              | List your domains                |
| POST   | /api/domains                              | Add a domain                     |
| GET    | /api/domains/:id                          | Domain details                   |
| PUT    | /api/domains/:id                          | Update SMTP settings / verified  |
| DELETE | /api/domains/:id                          | Delete a domain                  |
| GET    | /api/domains/:id/records                  | List DNS records                 |
| POST   | /api/domains/:id/records                  | Add a DNS record                 |
| PUT    | /api/domains/:id/records/:recordId        | Update a DNS record              |
| DELETE | /api/domains/:id/records/:recordId        | Delete a DNS record              |

All `/api/domains*` routes require `Authorization: Bearer <token>`.

## Notes / next steps

- Domain "verified" is currently a manual toggle. For real DNS verification you'd
  add a background job that does DNS lookups (e.g. with Node's `dns` module) and
  compares them against the records you've saved.
- SMTP credentials are stored encrypted, but sending email isn't wired up yet —
  you could plug in `nodemailer` using the saved SMTP settings for a "send test email" feature.
- For production, move `JWT_SECRET` and `ENCRYPTION_KEY` to real secrets and enable HTTPS.
