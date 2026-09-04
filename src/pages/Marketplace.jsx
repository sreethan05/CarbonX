import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Leaf, Loader2, CheckCircle2, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  buyCredit,
  getBlockchainHealth,
  getMarketplaceListings,
  placeListingBid,
  combinedCredits,
} from '../services/api';

function formatListing(row) {
  const c = combinedCredits({
    carbon_tonnes: row.carbon_credits,
    biodiversity_credits: row.biodiversity_credits,
    total_credits: row.total_credits,
  });
  return {
    id: row.id,
    farmer: row.farmer_name,
    location: row.location,
    crop: row.crop,
    carbon: c.carbon,
    biodiversity: c.biodiversity,
    total: c.total,
    price: row.price_per_credit,
    tokenId: row.token_id,
    bids: row.bids_count || 0,
    status: row.status,
  };
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [boughtIds, setBoughtIds] = useState([]);
  const [bcOnline, setBcOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [listRes, online] = await Promise.all([
        getMarketplaceListings().catch(() => ({ success: false, listings: [] })),
        getBlockchainHealth(),
      ]);
      if (!cancelled) {
        setBcOnline(online);
        const rows = listRes.success ? listRes.listings || [] : [];
        setListings(rows.map(formatListing));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase();
    return !q || [l.farmer, l.location, l.crop].some((s) => s?.toLowerCase().includes(q));
  });

  const handleBuy = async (listing) => {
    setBuyingId(listing.id);
    try {
      if (bcOnline && listing.tokenId) {
        await buyCredit(listing.tokenId, listing.price * listing.total, null);
      }
      await placeListingBid(listing.id);
    } catch {
      /* bid may still record in database */
    }
    setTimeout(() => {
      setBuyingId(null);
      setBoughtIds((prev) => [...prev, listing.id]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-warm-white font-inter text-carbon-800 pb-28">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-forest-100/50 py-4 px-5 shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-manrope font-extrabold text-base text-carbon-900">{t('marketPageTitle')}</h1>
              <p className="text-[10px] text-carbon-400">{t('marketPageSubtitle')}</p>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${bcOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {bcOnline ? `⛓ ${t('onChain')}` : t('chainOffline')}
            </span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-3 text-carbon-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchFarmer')}
              className="w-full bg-warm-white border border-forest-100 rounded-xl pl-8 pr-3 py-2.5 text-xs"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-5 space-y-3">
        {user && (
          <button type="button" onClick={() => navigate('/create-listing')}
            className="w-full bg-forest-800 text-white text-xs font-bold py-3 rounded-2xl">
            {t('listMyCredits')}
          </button>
        )}

        {loading ? (
          <div className="flex justify-center py-16 text-carbon-400 text-sm gap-2">
            <Loader2 className="animate-spin w-4 h-4" /> {t('loadingListings')}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-carbon-400 text-sm">{t('noListings')}</p>
        ) : (
          filtered.map((listing) => {
            const isBuying = buyingId === listing.id;
            const isBought = boughtIds.includes(listing.id);
            return (
              <article key={listing.id} className="bg-white border border-forest-100 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-800">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-carbon-900">{listing.farmer}</p>
                    <p className="text-[10px] text-carbon-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {listing.location || 'India'}
                    </p>
                    <p className="text-[10px] text-carbon-400 mt-1">{listing.crop}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {listing.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-amber-50 rounded-xl py-2 px-1">
                    <p className="text-[9px] text-carbon-400 uppercase font-bold">{t('carbonLabel')}</p>
                    <p className="font-black text-amber-800">{listing.carbon} t</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl py-2 px-1">
                    <p className="text-[9px] text-carbon-400 uppercase font-bold">{t('bioLabel')}</p>
                    <p className="font-black text-purple-800">{listing.biodiversity} t</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl py-2 px-1">
                    <p className="text-[9px] text-carbon-400 uppercase font-bold">{t('combinedLabel')}</p>
                    <p className="font-black text-emerald-800">{listing.total} t</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-carbon-500">
                    <Leaf size={12} className="inline mr-1 text-forest-600" />
                    ₹{listing.price}/{t('credits')} · {listing.bids} bids
                  </span>
                  <button type="button" onClick={() => handleBuy(listing)} disabled={isBuying || isBought}
                    className={`px-4 py-2 rounded-xl font-bold text-[11px] ${isBought ? 'bg-emerald-100 text-emerald-700' : 'bg-forest-800 text-white hover:bg-forest-900'}`}>
                    {isBuying ? (
                      <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /></span>
                    ) : isBought ? (
                      <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {t('bidPlaced')}</span>
                    ) : (
                      t('buyBid')
                    )}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-forest-100/50 py-2.5 px-4 flex justify-around shadow-lg">
        <button type="button" onClick={() => navigate('/farmer-dashboard')} className="flex flex-col items-center gap-1 flex-1 text-[10px] text-carbon-400">
          <span className="text-xl">🏡</span> {t('home')}
        </button>
        <button type="button" onClick={() => navigate('/farm-map')} className="flex flex-col items-center gap-1 flex-1 text-[10px] text-carbon-400">
          <span className="text-xl">🗺️</span> {t('farm')}
        </button>
        <button type="button" onClick={() => navigate('/marketplace')} className="flex flex-col items-center gap-1 flex-1 text-[10px] font-bold text-carbon-800">
          <span className="text-xl">🛍️</span> {t('market')}
        </button>
        <button type="button" onClick={() => navigate('/wallet')} className="flex flex-col items-center gap-1 flex-1 text-[10px] text-carbon-400">
          <span className="text-xl">💰</span> {t('wallet')}
        </button>
      </nav>
    </div>
  );
}
