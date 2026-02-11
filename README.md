# Copart BidCalc MVP (Next.js)

MVP: VIN decode + Copart Canada fees (Pre-bid/Secured) + Québec taxes + Profit ladder + Deal Queue (localStorage).

## 1) Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 2) Deploy (GitHub + Vercel)

1. Create a GitHub repo
2. Push this folder to the repo
3. In Vercel: **New Project** → Import repo → Deploy

## 3) Data sources / references (for your verification)

- Copart Canada member fees page (Gate fee, Environmental fee, Virtual Bid Fee tables, Bidding Fees tables):  
  https://www.copart.com/content/us/en/member-fees-canada

- Québec tax rates: GST 5% + QST 9.975%  
  https://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/basic-rules-for-applying-the-gsthst-and-qst/tables-of-gst-and-qst-rates/

- FX rate (USD/CAD) via Bank of Canada Valet API (no key required):  
  https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1

- VIN decode via NHTSA vPIC:  
  https://vpic.nhtsa.dot.gov/api/

## 4) Next upgrade: Supabase (Deal Queue sync)

### Suggested schema

```sql
create table deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  vin text not null,
  decoded jsonb,
  input jsonb not null,
  result jsonb not null,
  ladder jsonb not null,
  notes text
);
create index deals_user_created_idx on deals (user_id, created_at desc);
```

Then replace localStorage with Supabase inserts/selects.

## 5) Limitations

- This MVP uses **Copart Canada** fee tables only.
- Taxes are simplified and configurable (sale-only vs sale+fees).
- Storage/late/relist fees are not included (they depend on timing/location).

## 6) Supabase setup (Auth + Deals sync)

### A) Create project
- Create a Supabase project
- Enable Email (OTP / magic link) auth
- Add Redirect URLs: `http://localhost:3000` and your Vercel domain

### B) Create table + RLS
Run this in Supabase SQL editor:

```sql
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  vin text not null,
  decoded jsonb,
  input jsonb not null,
  result jsonb not null,
  ladder jsonb not null,
  notes text
);

alter table deals enable row level security;

create policy "deals_select_own" on deals
  for select using (auth.uid() = user_id);

create policy "deals_insert_own" on deals
  for insert with check (auth.uid() = user_id);

create policy "deals_delete_own" on deals
  for delete using (auth.uid() = user_id);
```

### C) Env vars
Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

On Vercel: add the same env vars.

---
If env vars are missing, the app still builds and works in localStorage mode (Supabase UI will show a configuration hint).
