# ResinStock Backend

Node.js + Express backend for resin production tracking.

✅ Features:
- Stock-in (purchase)
- Stock-out (sales)
- Real-time stock balance
- Invoice PDF generation
- Auto-upload invoices to Google Drive
- Payment tracking
- Supabase (PostgreSQL) database ready

## Setup
1. Copy `.env.example` to `.env`
2. Fill in:
   - DATABASE_URL from Supabase
   - Google Drive service account (base64 JSON)
3. Run SQL from `src/migrations/001_init.sql` in Supabase SQL editor.
4. Deploy backend to Render:
   - Build Command: `npm install`
   - Start Command: `npm run start`
   - Environment variable: `DATABASE_URL`

When you POST to `/api/sales`, it’ll:
- Generate an invoice
- Upload to your Google Drive
- Return JSON with Drive link + invoice info

