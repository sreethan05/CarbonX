-- The Data API is intentionally not auto-exposing new tables. Give only the
-- backend's service_role the table privileges it needs; do not grant anon.

grant usage on schema public to service_role;
grant select, insert, update, delete on table
  public.profiles,
  public.otp_codes,
  public.farms,
  public.marketplace_listings,
  public.kyc_verifications
to service_role;
