-- CarbonX initial Supabase schema
-- Run this migration on a new Supabase project before
-- 20260524_preferred_language.sql (which is safe to re-run).

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text not null default '',
  state text default '',
  district text default '',
  village text default '',
  upi text default '',
  aadhaar_last4 text default '',
  role text not null default 'farmer',
  wallet_address text,
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No foreign key to profiles: registration OTPs are issued before a profile
-- exists, and expired/used codes are deleted by the backend.
create table if not exists public.otp_codes (
  phone text primary key,
  otp text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  owner_phone text not null references public.profiles(phone) on delete cascade,
  name text not null default 'My Farm',
  crop_type text default 'Mixed Crop',
  irrigation text default 'Drip',
  geojson jsonb not null,
  area_hectares numeric not null default 0,
  ndvi numeric default 0,
  evi numeric default 0,
  carbon_tonnes numeric default 0,
  biodiversity_score numeric default 0,
  biodiversity_credits numeric default 0,
  total_credits numeric default 0,
  tree_cover numeric default 0,
  soil_moisture numeric default 0,
  vegetation_health text default '',
  ai_confidence numeric default 0,
  satellite_source text default '',
  status text not null default 'Verified',
  token_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_phone text not null references public.profiles(phone) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  farmer_name text not null default '',
  location text default '',
  crop text default 'Mixed Crop',
  size_label text default '',
  carbon_credits numeric not null default 0,
  biodiversity_credits numeric not null default 0,
  total_credits numeric not null default 0,
  price_per_credit numeric not null default 520,
  current_bid numeric not null default 0,
  bids_count integer not null default 0,
  status text not null default 'Active',
  listing_model text default '',
  token_id text,
  tx_hash text,
  image_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists farms_owner_phone_idx
  on public.farms(owner_phone);
create index if not exists marketplace_listings_farmer_phone_idx
  on public.marketplace_listings(farmer_phone);
create index if not exists marketplace_listings_status_idx
  on public.marketplace_listings(status);

-- The current application reads and writes through the FastAPI backend using
-- Supabase's service-role key. Keep direct browser access blocked by default.
alter table public.profiles enable row level security;
alter table public.otp_codes enable row level security;
alter table public.farms enable row level security;
alter table public.marketplace_listings enable row level security;
