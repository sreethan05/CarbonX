import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, ChevronLeft, Shield, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { combinedCredits } from '../services/api';

const CREDIT_PRICE = 520;

export default function CarbonWallet() {
  const navigate = useNavigate();
  const { user, farms } = useAuth();

  const { verifiedCredits, pendingCredits, initialBalance, farmActivities } = useMemo(() => {
    let verified = 0, pending = 0;
    const acts = farms.map((f, i) => {
      const c = combinedCredits(f);
      if (f.status === 'Verified' || !f.status) verified += c.total; else pending += c.total;
      return {
        id: `farm-${f.id || i}`,
        title: `Satellite Verification — ${f.name || 'Farm'}`,
        credits: c.total,
        date: f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Registered',
        status: f.status || 'Verified',
        meta: f.ndvi != null ? `NDVI ${f.ndvi}` : undefined,
      };
    });
    return { verifiedCredits: verified, pendingCredits: pending, initialBalance: verified * CREDIT_PRICE, farmActivities: acts };
  }, [farms]);

  const upiId = user?.upi || '';
  const [balance, setBalance] = useState(initialBalance);
  const [activities, setActivities] = useState(farmActivities);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { setBalance(initialBalance); setActivities(farmActivities); }, [initialBalance, farmActivities]);

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > balance) return;
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false); setSuccess(true); setBalance(prev => prev - amt);
      setActivities([{ id: `act-${Date.now()}`, title: 'UPI Payout', amount: -amt, date: 'Today', status: 'Completed' }, ...activities]);
      setTimeout(() => { setSuccess(false); setShowWithdraw(false); setWithdrawAmount(''); }, 2000);
    }, 2000);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center p-2 rounded-xl bg-white border border-forest-100 text-carbon-600 hover:text-forest-800">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-black tracking-wider uppercase text-carbon-800">Carbon Wallet</h2>
        <div className="w-9 h-9" />
      </div>

      {/* Ledger card */}
      <div className="bg-forest-900 text-white rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] text-forest-300 font-bold uppercase tracking-wider">Carbon Ledger</span>
            <h3 className="text-2xl font-black text-white mt-1">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-white/60 mt-1">Token Balance Value</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-forest-300"><Shield className="w-5 h-5" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/40">Verified Credits</p>
            <p className="text-sm font-black text-white mt-0.5">{verifiedCredits.toFixed(1)} t</p>
            <p className="text-[9px] text-forest-300 mt-0.5">₹{(verifiedCredits * CREDIT_PRICE).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/40">Pending</p>
            <p className="text-sm font-black text-white mt-0.5">{pendingCredits.toFixed(1)} t</p>
            <p className="text-[9px] text-orange-400 mt-0.5">Est: ₹{(pendingCredits * CREDIT_PRICE).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button onClick={() => setShowWithdraw(true)} disabled={balance <= 0}
            className="py-3 px-4 rounded-xl bg-forest-500 text-white font-bold text-xs transition-all hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-1.5">
            <ArrowUpRight className="w-4 h-4" /><span>Withdraw UPI</span>
          </button>
          <div className="py-3 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5">
            <span>View Contract</span>
          </div>
        </div>
      </div>

      {/* UPI bar */}
      <div className="bg-white rounded-2xl p-4 border border-forest-100 shadow-sm flex items-center justify-between text-xs mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-forest-50 text-forest-700 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
          <div>
            <p className="font-bold text-carbon-800">Linked UPI</p>
            <p className="text-[10px] text-carbon-400 font-mono">{upiId || 'No UPI linked'}</p>
          </div>
        </div>
        <span className="text-[9px] bg-forest-50 text-forest-700 font-bold px-2 py-0.5 rounded-full">VERIFIED</span>
      </div>

      {/* Transaction history */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-xs font-bold text-carbon-600 uppercase tracking-wider">Transaction History</h4>
        <span className="text-[10px] text-carbon-400 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Immutable Log</span>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-forest-100 shadow-sm space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs text-carbon-400 text-center py-4">No transactions yet. Register and verify a farm to start earning credits.</p>
        ) : activities.map((act) => (
          <div key={act.id} className="flex justify-between items-start text-xs border-b border-forest-50 pb-3.5 last:border-0 last:pb-0">
            <div className="flex gap-3">
              <div className={`p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 ${act.amount !== undefined && act.amount < 0 ? 'bg-orange-50 text-orange-600' : 'bg-forest-50 text-forest-700'}`}>
                {act.amount !== undefined && act.amount < 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
              </div>
              <div>
                <h5 className="font-bold text-carbon-800">{act.title}</h5>
                <p className="text-[10px] text-carbon-400 mt-0.5">{act.date} {act.meta && `· ${act.meta}`}</p>
              </div>
            </div>
            <div className="text-right">
              {act.amount !== undefined ? (
                <p className={`font-black ${act.amount > 0 ? 'text-forest-700' : 'text-carbon-800'}`}>{act.amount > 0 ? '+' : ''}₹{Math.abs(act.amount).toLocaleString('en-IN')}</p>
              ) : (
                <p className="font-black text-forest-700">+{act.credits} tCO2e</p>
              )}
              <span className={`inline-block text-[8px] font-mono px-2 py-0.5 rounded-full font-bold mt-1 uppercase ${act.status === 'Completed' ? 'bg-forest-50 text-forest-700' : 'bg-orange-50 text-orange-600'}`}>{act.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Withdraw modal */}
      {showWithdraw && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowWithdraw(false)} />
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-6 pb-8 border-t border-forest-100 shadow-2xl z-50 text-carbon-800">
            <div className="w-12 h-1 bg-forest-100 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-1">Instant UPI Cashout</h3>
            <p className="text-xs text-carbon-500 mb-6">Funds will be deposited into your verified bank account via UPI.</p>
            <form onSubmit={handleWithdraw} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-carbon-500 block mb-2">Withdrawal Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-carbon-400">₹</span>
                  <input type="number" max={balance} min="1" required placeholder="Enter amount" value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-16 py-4 bg-forest-50 border border-forest-100 rounded-2xl font-black text-lg focus:outline-none focus:border-forest-600 focus:bg-white transition-all" />
                  <button type="button" onClick={() => setWithdrawAmount(balance.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-forest-700 text-white rounded-lg text-[10px] font-bold uppercase">MAX</button>
                </div>
                <p className="text-[10px] text-carbon-400 mt-2 flex justify-between px-1">
                  <span>Available: ₹{balance.toLocaleString('en-IN')}</span><span>Fee: ₹0</span>
                </p>
              </div>
              {success ? (
                <div className="p-4 bg-forest-50 text-forest-700 rounded-2xl text-center font-bold text-xs border border-forest-200 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-forest-700" /><span>Payout Successful!</span>
                </div>
              ) : (
                <button type="submit" disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) > balance}
                  className="w-full py-4 rounded-2xl bg-forest-800 text-white font-bold shadow-lg hover:bg-forest-900 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {withdrawing ? <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /><span>Processing...</span></>
                  : <><span>Confirm Transfer</span><ArrowUpRight className="w-4 h-4" /></>}
                </button>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
