import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Leaf, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMarketplaceListings, placeListingBid, combinedCredits } from '../services/api';

function formatListing(row) {
  const c = combinedCredits({ carbon_tonnes: row.carbon_credits, biodiversity_credits: row.biodiversity_credits, total_credits: row.total_credits });
  return { id: row.id, farmer: row.farmer_name || 'Farmer', location: row.location || '', crop: row.crop || 'Carbon Credits',
    carbon: c.carbon, biodiversity: c.biodiversity, total: c.total, price: row.price_per_credit || 520,
    tokenId: row.token_id, bids: row.bids_count || 0, status: row.status || 'Active' };
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bidding, setBidding] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);

  useEffect(() => {
    getMarketplaceListings().then(res => {
      if (res.success && res.listings) setListings(res.listings.map(formatListing));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l =>
    !search || l.crop.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleBid = async (id) => {
    setBidding(id);
    try {
      const res = await placeListingBid(id);
      if (res.success) {
        setBidSuccess(id);
        setListings(prev => prev.map(l => l.id === id ? { ...l, bids: l.bids + 1 } : l));
        setTimeout(() => setBidSuccess(null), 3000);
      }
    } catch {}
    setBidding(null);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <h1 className="text-lg font-bold text-carbon-900 mb-4">Carbon Credit Marketplace</h1>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-carbon-400" />
        <input type="text" placeholder="Search by crop or location..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-forest-100 rounded-2xl text-xs font-semibold focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-forest-700" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-forest-200 rounded-2xl p-8 text-center text-sm text-carbon-500">
          No listings available yet. {role === 'farmer' && 'Create a listing from your dashboard to sell credits.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-forest-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold text-carbon-900">{l.crop}</h3>
                  {l.location && <p className="text-[10px] text-carbon-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {l.location}</p>}
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${l.status === 'Active' ? 'bg-forest-50 text-forest-700' : 'bg-orange-50 text-orange-600'}`}>{l.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-forest-50/50 rounded-xl p-2">
                  <p className="text-[8px] uppercase text-carbon-400 font-bold">Carbon</p>
                  <p className="text-sm font-black text-amber-800">{l.carbon}</p>
                </div>
                <div className="bg-forest-50/50 rounded-xl p-2">
                  <p className="text-[8px] uppercase text-carbon-400 font-bold">Bio</p>
                  <p className="text-sm font-black text-forest-700">{l.biodiversity}</p>
                </div>
                <div className="bg-forest-50/50 rounded-xl p-2">
                  <p className="text-[8px] uppercase text-carbon-400 font-bold">Total</p>
                  <p className="text-sm font-black text-forest-900">{l.total}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-forest-50">
                <div>
                  <p className="text-lg font-black text-forest-800">₹{l.price}<span className="text-[10px] font-normal text-carbon-400">/credit</span></p>
                  <p className="text-[10px] text-carbon-400">{l.bids} bid{l.bids !== 1 ? 's' : ''}</p>
                </div>
                {bidSuccess === l.id ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-forest-700"><CheckCircle2 size={16} /> Bid Placed!</div>
                ) : (
                  <button onClick={() => handleBid(l.id)} disabled={bidding === l.id}
                    className="px-4 py-2.5 bg-forest-800 text-white rounded-xl text-xs font-bold hover:bg-forest-900 transition-colors disabled:opacity-60 flex items-center gap-1.5">
                    {bidding === l.id ? <Loader2 size={14} className="animate-spin" /> : <Leaf size={14} />}
                    {role === 'buyer' ? 'Place Bid' : 'View'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
