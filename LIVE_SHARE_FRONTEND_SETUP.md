# Live Share Frontend Setup

Use this when your partner will work on the React frontend while PostgreSQL and the API stay on your laptop.

## Start your local backend

In your own terminal:

```powershell
cd C:\Users\HpProbook\OneDrive\Documents\Inventory\backend
npm.cmd run dev
```

Keep PostgreSQL running locally. Do not share port `54321`.

## Start the frontend

In another terminal:

```powershell
cd C:\Users\HpProbook\OneDrive\Documents\Inventory\frontend
npm.cmd run dev
```

Vite will run on port `5173`. Frontend API calls go to `/api`, then Vite proxies them to your local backend at `127.0.0.1:4000`.

## Share with your frontend partner

Best setup:

1. Open a separate VS Code window at:
   `C:\Users\HpProbook\OneDrive\Documents\Inventory\frontend`
2. Start **Live Share** from that frontend-only VS Code window.
3. Share/forward only port `5173`.
4. Do not share PostgreSQL port `54321`.
5. You can avoid sharing backend code by sharing only the `frontend` folder window.

Your partner can edit React/CSS files and preview the app through the forwarded frontend URL, while all database data still comes from your local PostgreSQL through your local backend.
