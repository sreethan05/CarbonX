import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createMarketplaceListing, combinedCredits } from '../services/api';

export default function CreateListing() {
  const navigate = useNavigate();
  const { user, farms } = useAuth();

  const totals = useMemo(() => {
    let carbon = 0, bio = 0;
    farms.forEach(f => { const c = combinedCredits(f); carbon += c.carbon; bio += c.biodiversity; });
    return { carbon, bio, total: carbon + bio };
  }, [farms]);

  const [creditsToSell, setCreditsToSell] = useState(Math.min(24, totals.total || 1));
  const [pricePerCredit, setPricePerCredit] = useState(520);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const estRevenue = Math.round(creditsToSell * pricePerCredit);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const farm = farms[0];
      const res = await createMarketplaceListing({
        farm_id: farm?.id,
        credits: creditsToSell,
        price_per_credit: pricePerCredit,
        crop: farm?.crop_type || 'Carbon Credits',
        location: [farm?.village, farm?.district].filter(Boolean).join(', '),
      });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate('/marketplace'), 2000);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white border border-forest-100 text-carbon-600 hover:text-forest-800">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-carbon-900">Create Credit Listing</h1>
      </div>

      {totals.total === 0 ? (
        <div className="bg-white border border-dashed border-forest-200 rounded-2xl p-8 text-center text-sm text-carbon-500">
          You need verified farms with carbon credits before creating a listing.
          <button onClick={() => navigate('/farm-map')} className="block mx-auto mt-4 px-6 py-3 bg-forest-800 text-white rounded-2xl text-xs font-bold">Map Your Farm</button>
        </div>
      ) : success ? (
        <div className="bg-forest-50 border border-forest-200 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-forest-600 mx-auto mb-3" />
          <p className="font-bold text-forest-900">Listing Created Successfully!</p>
          <p className="text-xs text-forest-700 mt-1">Redirecting to marketplace...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-forest-100 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-forest-50/50 rounded-xl p-3">
              <p className="text-[9px] uppercase text-carbon-400 font-bold">Available Carbon</p>
              <p className="text-lg font-black text-amber-800">{totals.carbon.toFixed(1)}</p>
            </div>
            <div className="bg-forest-50/50 rounded-xl p-3">
              <p className="text-[9px] uppercase text-carbon-400 font-bold">Available Bio</p>
              <p className="text-lg font-black text-forest-700">{totals.bio.toFixed(1)}</p>
            </div>
            <div className="bg-forest-50 rounded-xl p-3 border border-forest-200">
              <p className="text-[9px] uppercase text-forest-700 font-bold">Total</p>
              <p className="text-lg font-black text-forest-900">{totals.total.toFixed(1)}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide block mb-2">Credits to Sell</label>
            <input type="number" min="1" max={totals.total} value={creditsToSell}
              onChange={e => setCreditsToSell(Math.min(parseFloat(e.target.value) || 0, totals.total))}
              className="w-full p-3.5 bg-forest-50 border border-forest-100 rounded-2xl text-lg font-black focus:outline-none focus:border-forest-600 focus:bg-white" />
            <input type="range" min="1" max={Math.max(1, totals.total)} value={creditsToSell}
              onChange={e => setCreditsToSell(parseFloat(e.target.value))}
              className="w-full mt-3 accent-forest-700" />
          </div>

          <div>
            <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide block mb-2">Price per Credit (₹)</label>
            <input type="number" min="100" step="10" value={pricePerCredit}
              onChange={e => setPricePerCredit(parseFloat(e.target.value) || 0)}
              className="w-full p-3.5 bg-forest-50 border border-forest-100 rounded-2xl text-lg font-black focus:outline-none focus:border-forest-600 focus:bg-white" />
          </div>

          <div className="bg-forest-900 text-white rounded-2xl p-5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-forest-300 font-bold">Estimated Revenue</p>
            <p className="text-3xl font-black text-white mt-1">₹{estRevenue.toLocaleString('en-IN')}</p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-forest-800 text-white rounded-2xl text-xs font-bold hover:bg-forest-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {loading ? 'Creating Listing...' : 'List for Sale'}
          </button>
        </form>
      )}
    </div>
  );
}
