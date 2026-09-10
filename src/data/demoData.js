/**
 * CarbonX Demo Data Cache
 * Used as fallback when backend is unreachable.
 * Cached in localStorage for offline demo support.
 */

const CACHE_KEY = 'carbonx_demo_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ── Seed FPO farmers ──
const SEED_FARMERS = [
  {
    id: 'fpo-f-001',
    name: 'Ramesh Reddy',
    phone: '9876543210',
    aadhaar: '234123412341',
    village: 'Pochampally',
    district: 'Yadadri Bhuvanagiri',
    state: 'Telangana',
    farm_area: 2.5,
    crop_type: 'Cotton',
    irrigation: 'Drip',
    kyc_status: 'VERIFIED',
    kyc_date: '2026-09-05T10:30:00Z',
    farm_id: 'farm-001',
    ndvi_score: 0.72,
    carbon_credits: 12.5,
    biodiversity_score: 68,
    total_credits: 15.5,
    risk_level: 'low',
    onboarded_by: 'fpo-001',
    onboarded_date: '2026-09-04T08:00:00Z',
  },
  {
    id: 'fpo-f-002',
    name: 'Lakshmi Devi',
    phone: '9876501234',
    aadhaar: '345234523452',
    village: 'Bhongir',
    district: 'Yadadri Bhuvanagiri',
    state: 'Telangana',
    farm_area: 1.8,
    crop_type: 'Paddy',
    irrigation: 'Flood',
    kyc_status: 'VERIFIED',
    kyc_date: '2026-09-05T11:45:00Z',
    farm_id: 'farm-002',
    ndvi_score: 0.68,
    carbon_credits: 9.2,
    biodiversity_score: 55,
    total_credits: 11.0,
    risk_level: 'low',
    onboarded_by: 'fpo-001',
    onboarded_date: '2026-09-04T09:15:00Z',
  },
  {
    id: 'fpo-f-003',
    name: 'Suresh Kumar',
    phone: '9000012345',
    aadhaar: '456345634563',
    village: 'Aleru',
    district: 'Yadadri Bhuvanagiri',
    state: 'Telangana',
    farm_area: 3.2,
    crop_type: 'Maize',
    irrigation: 'Sprinkler',
    kyc_status: 'PENDING',
    kyc_date: null,
    farm_id: null,
    ndvi_score: null,
    carbon_credits: 0,
    biodiversity_score: null,
    total_credits: 0,
    risk_level: 'medium',
    onboarded_by: 'fpo-001',
    onboarded_date: '2026-09-06T07:30:00Z',
  },
  {
    id: 'fpo-f-004',
    name: 'Padma Bai',
    phone: '9123456789',
    aadhaar: '567456745674',
    village: 'Pochampally',
    district: 'Yadadri Bhuvanagiri',
    state: 'Telangana',
    farm_area: 1.2,
    crop_type: 'Turmeric',
    irrigation: 'Drip',
    kyc_status: 'FLAGGED',
    kyc_date: '2026-09-05T14:20:00Z',
    kyc_reasons: ['EXIF metadata missing from land document', 'Village geocode mismatch'],
    farm_id: null,
    ndvi_score: null,
    carbon_credits: 0,
    biodiversity_score: null,
    total_credits: 0,
    risk_level: 'high',
    onboarded_by: 'fpo-001',
    onboarded_date: '2026-09-05T13:00:00Z',
  },
  {
    id: 'fpo-f-005',
    name: 'Narsimha Rao',
    phone: '9345612378',
    aadhaar: '678567856785',
    village: 'Bhongir',
    district: 'Yadadri Bhuvanagiri',
    state: 'Telangana',
    farm_area: 4.0,
    crop_type: 'Cotton',
    irrigation: 'Rain-fed',
    kyc_status: 'VERIFIED',
    kyc_date: '2026-09-04T16:00:00Z',
    farm_id: 'farm-005',
    ndvi_score: 0.75,
    carbon_credits: 18.0,
    biodiversity_score: 72,
    total_credits: 21.5,
    risk_level: 'low',
    onboarded_by: 'fpo-001',
    onboarded_date: '2026-09-03T10:00:00Z',
  },
  {
    id: 'fpo-f-006',
    name: 'Satyamma',
    phone: '9445566778',
    aadhaar: '789678967896',
    village: 'Aleru',
    district: 'Yadadri Bhuvanagiri',
    state: 'Telangana',
    farm_area: 2.0,
    crop_type: 'Red Gram',
    irrigation: 'Rain-fed',
    kyc_status: 'VERIFIED',
    kyc_date: '2026-09-03T12:00:00Z',
    farm_id: 'farm-006',
    ndvi_score: 0.65,
    carbon_credits: 8.5,
    biodiversity_score: 60,
    total_credits: 10.0,
    risk_level: 'low',
    onboarded_by: 'fpo-001',
    onboarded_date: '2026-09-02T14:00:00Z',
  },
];

// ── Seed marketplace listings ──
const SEED_LISTINGS = [
  { id: 'list-001', farmer_name: 'Ramesh Reddy', village: 'Pochampally', state: 'Telangana', crop_type: 'Cotton', credits: 12.5, price_per_credit: 320, total_price: 4000, ndvi_score: 0.72, kyc_status: 'VERIFIED', status: 'active', created_date: '2026-09-05T12:00:00Z' },
  { id: 'list-002', farmer_name: 'Lakshmi Devi', village: 'Bhongir', state: 'Telangana', crop_type: 'Paddy', credits: 9.2, price_per_credit: 280, total_price: 2576, ndvi_score: 0.68, kyc_status: 'VERIFIED', status: 'active', created_date: '2026-09-05T13:00:00Z' },
  { id: 'list-003', farmer_name: 'Narsimha Rao', village: 'Bhongir', state: 'Telangana', crop_type: 'Cotton', credits: 18.0, price_per_credit: 310, total_price: 5580, ndvi_score: 0.75, kyc_status: 'VERIFIED', status: 'active', created_date: '2026-09-04T10:00:00Z' },
  { id: 'list-004', farmer_name: 'Satyamma', village: 'Aleru', state: 'Telangana', crop_type: 'Red Gram', credits: 8.5, price_per_credit: 340, total_price: 2890, ndvi_score: 0.65, kyc_status: 'VERIFIED', status: 'active', created_date: '2026-09-03T15:00:00Z' },
];

// ── Seed wallet transactions ──
const SEED_WALLET = [
  { id: 'tx-001', type: 'credit', amount: 12.5, source: 'Farm: Pochampally Cotton', date: '2026-09-05T10:30:00Z', status: 'confirmed' },
  { id: 'tx-002', type: 'credit', amount: 9.2, source: 'Farm: Bhongir Paddy', date: '2026-09-05T11:45:00Z', status: 'confirmed' },
  { id: 'tx-003', type: 'credit', amount: 18.0, source: 'Farm: Bhongir Cotton', date: '2026-09-04T16:00:00Z', status: 'confirmed' },
  { id: 'tx-004', type: 'debit', amount: 5.0, source: 'Sold to ITC Foods', date: '2026-09-05T15:00:00Z', status: 'confirmed' },
  { id: 'tx-005', type: 'credit', amount: 8.5, source: 'Farm: Aleru Red Gram', date: '2026-09-03T12:00:00Z', status: 'confirmed' },
];

// ── Cache helpers ──

export function getDemoFarmers() { return getCached('farmers', SEED_FARMERS); }
export function getDemoListings() { return getCached('listings', SEED_LISTINGS); }
export function getDemoWallet() { return getCached('wallet', SEED_WALLET); }

export function addDemoFarmer(farmer) {
  const farmers = getDemoFarmers();
  const updated = [{ ...farmer, id: `fpo-f-${Date.now()}`, onboarded_date: new Date().toISOString() }, ...farmers];
  setCached('farmers', updated);
  return updated;
}

export function updateDemoFarmer(id, updates) {
  const farmers = getDemoFarmers();
  const updated = farmers.map(f => f.id === id ? { ...f, ...updates } : f);
  setCached('farmers', updated);
  return updated;
}

function getCached(key, seed) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${key}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (Date.now() - data.ts < CACHE_TTL) { return data.value; }
    }
  } catch {}
  setCached(key, seed);
  return seed;
}

function setCached(key, value) {
  try { localStorage.setItem(`${CACHE_KEY}_${key}`, JSON.stringify({ value, ts: Date.now() })); } catch {}
}

export function clearDemoCache() {
  Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY)).forEach(k => localStorage.removeItem(k));
}

// ── FPO aggregate stats ──

export function getFpoStats(farmers) {
  const total = farmers.length;
  const verified = farmers.filter(f => f.kyc_status === 'VERIFIED').length;
  const pending = farmers.filter(f => f.kyc_status === 'PENDING').length;
  const flagged = farmers.filter(f => f.kyc_status === 'FLAGGED').length;
  const totalAcres = farmers.reduce((s, f) => s + (f.farm_area || 0), 0);
  const totalCredits = farmers.reduce((s, f) => s + (f.total_credits || 0), 0);
  const totalCarbon = farmers.reduce((s, f) => s + (f.carbon_credits || 0), 0);
  const ndviFarmers = farmers.filter(f => f.ndvi_score);
  const avgNdvi = ndviFarmers.length > 0 ? ndviFarmers.reduce((s, f) => s + f.ndvi_score, 0) / ndviFarmers.length : 0;

  return {
    totalFarmers: total,
    verified,
    pending,
    flagged,
    totalAcres: Math.round(totalAcres * 10) / 10,
    totalCredits: Math.round(totalCredits * 10) / 10,
    totalCarbon: Math.round(totalCarbon * 10) / 10,
    avgNdvi: Math.round(avgNdvi * 100) / 100,
  };
}
