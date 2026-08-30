# TAASTORE Manual Production — WhatsApp + Cloud Orders + Verified Reviews

This version keeps the manual WhatsApp ordering flow but moves orders/reviews to Supabase so published reviews are shared across visitors and devices.

## Before deploying
1. Create a Supabase project with the business owner/guardian if required.
2. Open SQL Editor and run `supabase-schema.sql`.
3. In Vercel Project Settings → Environment Variables, add the three variables from `.env.example`.
4. Never put `SUPABASE_SERVICE_ROLE_KEY` in `index.html` or GitHub.
5. Redeploy after adding variables.

## Admin
The site asks for the `ADMIN_KEY` only when opening the admin panel. The key is sent over HTTPS to serverless API endpoints and is never hard-coded in the frontend.

## Manual flow
Customer → Pesan Sekarang → WhatsApp template → you verify payment manually → Admin marks PAID → Admin marks COMPLETED → customer submits review → server verifies order + GrowID + COMPLETED → public review gets Verified Purchase.

## Important
WhatsApp itself does not notify the website that you have completed an order. You must use the admin panel to update the status until a future payment/automation integration is added.
