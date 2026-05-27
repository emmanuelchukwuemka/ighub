# IGHub Kids Code Camp 2026

Next.js registration app with SQL data storage, Paystack payment initialization, referral tracking, countdown timer, and admin export.

## Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the SQLite database and Prisma client:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

## Environment variables

- `DATABASE_URL`: e.g. `file:./dev.db`
- `PAYSTACK_SECRET_KEY`: your Paystack secret key
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: your Paystack public key
- `ADMIN_SECRET`: secret token for admin preview and export

## Features

- Countdown timer to August 2026
- Clean registration form for parent and child information
- Paystack payment initialization on submit
- Referral code input and generated referral code storage
- Admin preview page with CSV export support

## Admin

Open `/admin?secret=YOUR_SECRET` to view registrations and download export data.
