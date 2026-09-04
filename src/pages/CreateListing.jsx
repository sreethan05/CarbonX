import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { mintCredit, listCredit, createMarketplaceListing, combinedCredits } from '../services/api';

export default function CreateListing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, farms } = useAuth();

  const totals = useMemo(() => {
    let carbon = 0;
    let bio = 0;
    farms.forEach((f) => {
      const c = combinedCredits(f);
      carbon += c.carbon;
      bio += c.biodiversity;
    });
    return { carbon, bio, total: carbon + bio };
  }, [farms]);

  const [creditsToSell, setCreditsToSell] = useState(Math.min(24, totals.total || 1));
  const [pricePerCredit, setPricePerCredit] = useState(520);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);

  const carbonShare = totals.total > 0 ? (totals.carbon / totals.total) * creditsToSell : creditsToSell;
  const bioShare = creditsToSell - carbonShare;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/farmer-login');
    setLoading(true);
    setStatus(`${t('processing')} — mint…`);

    let tokenId = null;
    let txHash = null;
    const farm = farms[0];

    try {
      const mintRes = await mintCredit({
        farmerAddress: null,
        farmCoordinatesHash: farm?.geojson
          ? `0x${btoa(JSON.stringify(farm.geojson.geometry?.coordinates || [])).slice(0, 32)}`
          : `0x${Date.now().toString(16)}`,
        carbonAmount: carbonShare,
        ndviMean: farm?.ndvi || 0.5,
        verificationProof: `GEE-${Date.now()}`,
        uri: `carbonx://farm/${farm?.id || 'local'}`,
      });
      tokenId = mintRes.tokenId;
      txHash = mintRes.txHash;
      setStatus(`${t('mintSuccess')} #${tokenId}`);

      const listPrice = Math.round(pricePerCredit * creditsToSell);
      await listCredit(tokenId, listPrice);
      setStatus(`${t('mintSuccess')} #${tokenId} — listed on chain`);
    } catch (err) {
      setStatus(err?.message?.includes('not configured') ? t('chainRequired') : t('chainOffline'));
    }

    try {
      const listRes = await createMarketplaceListing({
        carbon_credits: Math.round(carbonShare * 100) / 100,
        biodiversity_credits: Math.round(bioShare * 100) / 100,
        price_per_credit: pricePerCredit,
        farm_id: farm?.id || null,
        crop: farm?.crop_type || 'Mixed Crop',
        token_id: tokenId,
        tx_hash: txHash,
      });
      if (!listRes.success) {
        setStatus(listRes.message || t('serverError'));
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/marketplace'), 1500);
    } catch {
      setStatus(t('serverError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-warm-white">
        <div className="bg-white rounded-3xl p-8 text-center border border-forest-100 shadow-lg max-w-sm w-full">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h2 className="font-bold text-lg">{t('listingLive')}</h2>
          <p className="text-xs text-carbon-500 mt-2">{status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white pb-20">
      <header className="sticky top-0 bg-white border-b border-forest-100 px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-forest-50">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-sm">{t('listCombined')}</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white border border-forest-100 rounded-2xl p-4 text-xs space-y-2">
          <p className="font-bold text-carbon-800">{t('verifiedBalance')}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-carbon-400">{t('carbonLabel')}</p>
              <p className="font-black text-amber-800">{totals.carbon.toFixed(1)} t</p>
            </div>
            <div>
              <p className="text-carbon-400">{t('bioLabel')}</p>
              <p className="font-black text-purple-800">{totals.bio.toFixed(1)} t</p>
            </div>
            <div>
              <p className="text-carbon-400">{t('combinedLabel')}</p>
              <p className="font-black text-emerald-800">{totals.total.toFixed(1)} t</p>
            </div>
          </div>
        </div>

        <label className="block text-xs font-bold text-carbon-600">
          {t('creditsToList')}
          <input
            type="number"
            min={0.1}
            max={totals.total || 100}
            step={0.1}
            value={creditsToSell}
            onChange={(e) => setCreditsToSell(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full border border-forest-100 rounded-xl px-3 py-2.5"
            required
          />
        </label>

        <label className="block text-xs font-bold text-carbon-600">
          {t('pricePerCredit')}
          <input
            type="number"
            min={100}
            value={pricePerCredit}
            onChange={(e) => setPricePerCredit(parseInt(e.target.value, 10) || 520)}
            className="mt-1 w-full border border-forest-100 rounded-xl px-3 py-2.5"
            required
          />
        </label>

        {status && <p className="text-[10px] font-mono text-forest-700 bg-forest-50 p-2 rounded-xl">{status}</p>}

        <button
          type="submit"
          disabled={loading || totals.total <= 0}
          className="w-full bg-forest-800 text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 flex justify-center gap-2"
        >
          {loading ? <><Loader2 className="animate-spin w-4 h-4" /> {t('processing')}</> : t('mintAndList')}
        </button>
      </form>
    </div>
  );
}
