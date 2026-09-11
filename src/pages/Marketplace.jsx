import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMarketplaceListings, combinedCredits } from '../services/api';

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
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    getMarketplaceListings().then(res => {
      if (res.success && res.listings) setListings(res.listings.map(formatListing));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l =>
    !search || l.crop.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuantityChange = (id, change) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + change)
    }));
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
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          {filtered.map((l) => (
            <div key={l.id} className="border-b border-gray-100 py-6 px-4 last:border-0 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-0.5">{l.crop}</h3>
                
                {/* Subtitle / Farmer Name */}
                <p className="text-[15px] text-gray-600 mb-2">{l.farmer}</p>
                
                {/* Location / Date */}
                <div className="flex items-center gap-4 text-[13px] text-gray-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{l.location || 'Unknown Location'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span>Available: {l.total}</span>
                  </div>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-full">
                    Carbon: {l.carbon}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-full">
                    Bio: {l.biodiversity}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-full">
                    ₹{l.price}/credit
                  </span>
                  {l.status && (
                    <span className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-full">
                      {l.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Right side action area */}
              <div className="flex items-center gap-3 md:pl-6">
                 <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                   <button onClick={() => handleQuantityChange(l.id, -1)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 font-medium transition-colors">-</button>
                   <span className="px-3 text-sm font-semibold w-10 text-center border-x border-gray-300">{quantities[l.id] || 1}</span>
                   <button onClick={() => handleQuantityChange(l.id, 1)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 font-medium transition-colors">+</button>
                 </div>
                 <button 
                   onClick={() => alert(`Buying ${quantities[l.id] || 1} credits!`)}
                   className="text-[15px] font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors">
                   Buy {'>'}
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
