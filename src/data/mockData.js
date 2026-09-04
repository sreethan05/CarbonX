/** Minimal fallbacks when API / Supabase data is unavailable */

export const mockWallet = {
  balance: 0,
  verifiedCredits: 0,
  pendingCredits: 0,
  upiAccount: 'farmer@upi',
  tokenId: '—',
  blockchainExplorerLink: 'https://etherscan.io',
  activities: [],
};

export const mockFarmer = { name: 'Farmer', village: 'Village', phone: '', upiId: 'farmer@upi' };

export const mockMarketplace = { activeAuctions: [] };

export const mockFarms = [];

export const mockCorporate = {
  name: 'Corporate Buyer',
  companyName: 'Corporate Buyer',
  purchasedCredits: 0,
  esgTarget: 10000,
  complianceScore: 0,
  activeBids: 0,
  offsetsTimeline: [],
  portfolio: [],
};

export const mockAdmin = {
  name: 'Admin',
  revenueMetrics: { total: 0, monthly: 0, weekly: 0 },
  totalFarmsApproved: 0,
  activeDetections: 0,
};
