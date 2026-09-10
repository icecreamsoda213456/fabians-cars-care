# Database-Free Demo

Demo mode is enabled unless `VITE_DEMO_MODE=false`. Run `npm install` and
`npm run dev` in this directory. No backend or database is required for the demo.

The browser generates 28 fictional, itemized sales receipts, cash/GCash/card
transactions, cancelled orders, and sample staff activity. Checkout, receipt
viewing and printing, voiding, reports, product edits, and settings operate on
this separate sample workspace. No payments are collected. Demo staff entries
are not real authentication accounts, and their passwords are never stored.

Sample data persists across reloads and receipt tabs in localStorage under
`fabians-demo-workspace-v1`. Each browser and site origin has its own demo.
Use **Reset demo** to recreate the samples. This does not clear real login
sessions or access a database. Browser storage must be available.

Receipts are marked **DEMO ONLY - NOT VALID FOR PAYMENT**, including in print.
Sales/report totals are derived from the same receipt records and exclude voided
sales. The monthly chart shows six calendar months ending in the selected month.
Seeded inventory is the opening stock balance, not reconstructed historical stock.

For the actual authenticated application, set `VITE_DEMO_MODE=false` and configure
`VITE_API_BASE` for the backend, then restart/rebuild Vite. Unknown demo API routes
fail locally; they never fall through to the real API. This is a portfolio
simulation, not an offline synchronization system for production transactions.

## Checks

- `npm test`: isolated demo-store tests using Node's built-in test runner.
- `npm run build`: production frontend build.
