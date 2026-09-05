# Fabian's Car Care POS Rebuild Setup

This rebuild uses:

- React + Vite frontend
- Express API backend
- PostgreSQL database
- SQL scripts for pgAdmin

## 1. Create Database In pgAdmin

Open pgAdmin Query Tool and run:

```sql
create database fabians_inventory;
```

Connect to the new `fabians_inventory` database, then run:

```sql
-- Copy and run backend/db/schema.sql
-- Then copy and run backend/db/seed.sql
```

Seed logins:

```text
username: owner
password: admin123

username: admin
password: admin123

username: cashier
password: cashier123
```

## 2. Backend Environment

Copy:

```text
backend/.env.example
```

to:

```text
backend/.env
```

Update the password in:

```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/fabians_inventory
```

## 3. Run Backend

```bash
cd backend
npm run dev
```

API:

```text
http://127.0.0.1:4000/api
```

## 4. Run Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://127.0.0.1:5173
```

## SQL Scripts

Use [backend/db/queries.sql](backend/db/queries.sql) as your editable SQL workspace for pgAdmin.
