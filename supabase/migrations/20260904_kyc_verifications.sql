-- KYC evidence is server-only. Do not grant anon or authenticated access.
create table if not exists public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  owner_phone text not null references public.profiles(phone) on delete cascade,
  status text not null check (status in ('VERIFIED', 'FLAGGED')),
  reasons jsonb not null default '[]'::jsonb,
  checks jsonb not null default '{}'::jsonb,
  extracted_fields jsonb not null default '{}'::jsonb,
  document_name text not null,
  document_sha256 text not null,
  perceptual_hash text,
  created_at timestamptz not null default now()
);

create index if not exists kyc_verifications_owner_phone_idx
  on public.kyc_verifications(owner_phone, created_at desc);
create index if not exists kyc_verifications_document_sha256_idx
  on public.kyc_verifications(document_sha256);

alter table public.kyc_verifications enable row level security;
grant select, insert on public.kyc_verifications to service_role;
