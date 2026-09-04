const PY = '/py-api';
const BC = '/bc-api';

function authHeaders() {
  const token = localStorage.getItem('carbonx_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function patch(url, body) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(url) {
  const res = await fetch(url, { headers: authHeaders() });
  return res.json();
}

// ── Auth ──

export async function sendOtp(phone) {
  return post(`${PY}/send-otp`, { phone });
}

export async function sendLoginOtp(phone) {
  return post(`${PY}/login/send-otp`, { phone });
}

export async function registerUser(payload) {
  return post(`${PY}/register`, payload);
}

export async function loginUser(phone, otp) {
  return post(`${PY}/login`, { phone, otp });
}

export async function getMe() {
  return get(`${PY}/me`);
}

export async function updateProfile(fields) {
  return patch(`${PY}/profile`, fields);
}

// ── Farms & satellite (GEE + ML) ──

export async function analyzeFarm(geojson, farmName, cropType, irrigation) {
  return post(`${PY}/analyze`, {
    geojson,
    farm_name: farmName,
    crop_type: cropType,
    irrigation,
  });
}

export async function saveFarm(farm) {
  return post(`${PY}/save-farm`, { farm });
}

export async function predictBiodiversity(longitude, latitude) {
  const res = await fetch(
    `${PY}/predict?longitude=${longitude}&latitude=${latitude}`,
    { headers: authHeaders() }
  );
  return res.json();
}

// ── Marketplace ──

export async function getMarketplaceListings() {
  return get(`${PY}/marketplace/listings`);
}

export async function createMarketplaceListing(payload) {
  return post(`${PY}/marketplace/listings`, payload);
}

export async function placeListingBid(listingId) {
  return post(`${PY}/marketplace/listings/${listingId}/bid`, {});
}

// ── Blockchain ──

export async function mintCredit(payload) {
  return post(`${BC}/api/credits/mint`, payload);
}

export async function listCredit(tokenId, price) {
  return post(`${BC}/api/credits/list`, { tokenId, price });
}

export async function buyCredit(tokenId, price, buyerPrivateKey) {
  return post(`${BC}/api/credits/buy`, { tokenId, price, buyerPrivateKey });
}

export async function retireCredit(tokenId, ownerPrivateKey) {
  return post(`${BC}/api/credits/retire`, { tokenId, ownerPrivateKey });
}

export async function getCreditData(tokenId) {
  return get(`${BC}/api/credits/${tokenId}`);
}

export async function getBlockchainHealth() {
  try {
    const res = await fetch(`${BC}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/** Combined carbon + biodiversity credits from farm or analysis row */
export function combinedCredits(row) {
  const carbon = parseFloat(row?.carbon_tonnes ?? row?.carbon_credits ?? 0) || 0;
  const bio =
    parseFloat(row?.biodiversity_credits ?? 0) ||
    (parseFloat(row?.biodiversity_score ?? 0) / 40) ||
    0;
  const total = parseFloat(row?.total_credits ?? 0) || carbon + bio;
  return {
    carbon: Math.round(carbon * 100) / 100,
    biodiversity: Math.round(bio * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
