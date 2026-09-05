# Fabian's Car Care Inventory API

Modern backend for the React POS and inventory rebuild.

## Stack

- Node.js
- Express
- PostgreSQL
- `pg` database driver
- JWT-ready authentication

## Setup

1. Create PostgreSQL database:

```sql
create database fabians_inventory;
```

2. Copy environment file:

```bash
copy .env.example .env
```

3. Update `.env` with your PostgreSQL password.

4. Run schema and seed files in pgAdmin Query Tool:

```sql
-- backend/db/schema.sql
-- backend/db/seed.sql
```

5. Install and run:

```bash
npm install
npm run dev
```

Default API URL:

```text
http://127.0.0.1:4000
```

Account credentials are not displayed by the application. The owner can create
additional admin and cashier accounts from the Users screen.

## pgAdmin SQL Scripts

Use these files in pgAdmin Query Tool:

- `backend/db/schema.sql`
- `backend/db/seed.sql`
- `backend/db/queries.sql`
