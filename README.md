# TAASTORE V8.0.0 — Full Tools Layer

## What is preserved
`marketplace.html` is copied from the V7.21.6 Marketplace source. BUY atomic stock, BGL/DL unified stock, JUAL/SELL, orders, proof, favorites, reviews and existing admin logic are not rewritten in this V8 tools build.

## New pages
- `index.html`: Home / landing page.
- `marketplace.html`: preserved Marketplace.
- `tools.html`: Vend Locator, GrowScan, World Render and Premium Rental UI.
- `supabase_tools.sql`: new tables only.
- `supabase_stock_rpc.sql`: existing V7.21.6 stock RPC.

## Supabase
Run `supabase_tools.sql` once in SQL Editor. Do not delete existing Marketplace tables. Supabase Auth email/password is used by the new account UI.

## Vend data
The frontend is deliberately provider-agnostic. If `localStorage.taastore_vend_provider_url` exists, it calls `<provider>?item=...`; otherwise it reads the read-only `vend_listings` cache. A real community/provider feed must be connected before claiming live all-world coverage. No fake listings are generated.

Expected normalized listing object:
`item_name, world_name, price_text, machine_x, machine_y, source, source_listing_id, updated_at`.

The data ingestion job/backend should use a provider that permits this use. Do not expose Supabase service-role keys in frontend code.

## Rental
Normal users can read plans and their own subscriptions. They cannot write/activate subscriptions from the browser. Activation should be done by the admin/secure backend after payment verification. This prevents users from granting themselves Premium by editing frontend state.

## Test
- `unzip -t` passes.
- Inline JavaScript checked with Node syntax checker.
- Marketplace source preserved separately as `marketplace.html`.
