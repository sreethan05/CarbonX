-- Add role column to profiles for role-based access control
-- Roles: farmer, buyer, verifier, admin (default: farmer)
alter table public.profiles
  add column if not exists role text not null default 'farmer'
  check (role in ('farmer', 'buyer', 'verifier', 'admin'));
