import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  ExternalLink, 
  Info,
  ChevronLeft,
  Shield,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockWallet, mockFarmer } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { combinedCredits } from '../services/api';

const CREDIT_PRICE = 520;

export default function CarbonWallet() {
  const navigate = useNavigate();
  const { user, farms } = useAuth();

  const { verifiedCredits, pendingCredits, initialBalance, farmActivities } = useMemo(() => {
    let verified = 0;
    let pending = 0;
    const acts = farms.map((f, i) => {
      const c = combinedCredits(f);
      if (f.status === 'Verified' || !f.status) verified += c.total;
      else pending += c.total;
      return {
        id: `farm-${f.id || i}`,
        title: `Satellite Verification — ${f.name || 'Farm'}`,
         credits: c.total,
        date: f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Registered',
        status: f.status || 'Verified',
        meta: f.ndvi != null ? `NDVI ${f.ndvi}` : undefined,
      };
    });
    return {
      verifiedCredits: verified,
      pendingCredits: pending,
      initialBalance: verified * CREDIT_PRICE,
      farmActivities: acts,
    };
  }, [farms]);

  const upiId = user?.upi || mockFarmer.upiId;

  const [balance, setBalance] = useState(initialBalance);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activities, setActivities] = useState(farmActivities);

  useEffect(() => {
    setBalance(initialBalance);
    setActivities(farmActivities);
  }, [initialBalance, farmActivities]);

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > balance) return;

    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setSuccess(true);
      setBalance(prev => prev - amt);
      
      const newActivity = {
        id: `act-${Date.now()}`,
        type: 'payout',
        title: 'UPI Payout - Instant Transfer',
        amount: -amt,
        date: 'Today',
        status: 'Completed'
      };

      setActivities([newActivity, ...activities]);

      setTimeout(() => {
        setSuccess(false);
        setIsWithdrawOpen(false);
        setWithdrawAmount('');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto bg-earth-cream min-h-screen text-earth-dark font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={() => navigate('/farmer-dashboard')}
          className="flex items-center justify-center p-2 rounded-xl bg-white border border-earth-green/10 text-earth-muted hover:text-earth-dark"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-black tracking-wider uppercase text-earth-dark">Carbon Setu Ledger</h2>
        <div className="w-9 h-9" /> {/* spacer */}
      </div>

      {/* Main Ledger Card */}
      <div className="bg-earth-dark text-earth-cream rounded-3xl p-6 shadow-xl mb-6 border border-earth-green/20 relative overflow-hidden">
        {/* Subtle abstract circuit tracks */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-earth-green/10 rounded-full border border-earth-green/10 opacity-30 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full border border-earth-green/10" />
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] text-earth-accent font-bold uppercase tracking-wider">SECURE DIGITAL LEDGER</span>
            <h3 className="text-2xl font-black text-white mt-1">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-white/60 mt-1">Token Balance Value</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-earth-accent">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/40">Verified Credits</p>
            <p className="text-sm font-black text-white mt-0.5">{verifiedCredits.toFixed(1)} t</p>
            <p className="text-[9px] text-earth-accent mt-0.5">₹{(verifiedCredits * CREDIT_PRICE).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/40">Pending Review</p>
            <p className="text-sm font-black text-white mt-0.5">{pendingCredits.toFixed(1)} t</p>
            <p className="text-[9px] text-orange-400 mt-0.5">Est: ₹{(pendingCredits * CREDIT_PRICE).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => setIsWithdrawOpen(true)}
            disabled={balance <= 0}
            className="py-3 px-4 rounded-xl bg-earth-accent text-earth-dark font-bold text-xs tracking-wider transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw UPI</span>
          </button>
          <a
            href={mockWallet.blockchainExplorerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10 font-bold text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5"
          >
            <span>Scan Contract</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* UPI Details Bar */}
      <div className="bg-white rounded-2xl p-4 border border-earth-green/10 shadow-sm flex items-center justify-between text-xs mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-earth-green/5 text-earth-green rounded-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-earth-dark">Linked Bank Account</p>
            <p className="text-[10px] text-earth-muted font-mono">{upiId}</p>
          </div>
        </div>
        <span className="text-[9px] bg-earth-green/10 text-earth-green font-bold px-2 py-0.5 rounded-full">
          VERIFIED KYB
        </span>
      </div>

      {/* Ledger Audit Trail Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-xs font-bold text-earth-muted uppercase tracking-wider">Ledger Audit Trail</h4>
        <span className="text-[10px] text-earth-muted flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" /> Immutable Log
        </span>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-3xl p-5 border border-earth-green/10 shadow-sm space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs text-earth-muted text-center py-4">No farm credits yet. Register and scan a farm to build your ledger.</p>
        ) : (
          activities.map((act) => (
          <div key={act.id} className="flex justify-between items-start text-xs border-b border-earth-green/5 pb-3.5 last:border-0 last:pb-0">
            <div className="flex gap-3">
              <div className={`p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 ${
                act.amount !== undefined && act.amount < 0
                  ? 'bg-earth-accent/20 text-earth-dark' 
                  : 'bg-earth-green/10 text-earth-green'
              }`}>
                {act.amount !== undefined && act.amount < 0 ? (
                  <ArrowUpRight className="w-4.5 h-4.5" />
                ) : (
                  <ArrowDownLeft className="w-4.5 h-4.5" />
                )}
              </div>
              <div>
                <h5 className="font-bold text-earth-dark">{act.title}</h5>
                <p className="text-[10px] text-earth-muted mt-0.5">{act.date} {act.meta && `• ${act.meta}`}</p>
              </div>
            </div>
            <div className="text-right">
              {act.amount !== undefined ? (
                <p className={`font-black ${act.amount > 0 ? 'text-earth-green' : 'text-earth-dark'}`}>
                  {act.amount > 0 ? '+' : ''}₹{Math.abs(act.amount).toLocaleString('en-IN')}
                </p>
              ) : (
                <p className="font-black text-earth-green">
                  +{act.credits} tCO2e
                </p>
              )}
              
              <span className={`inline-block text-[8px] font-mono px-2 py-0.5 rounded-full font-bold mt-1 uppercase ${
                act.status === 'Completed'
                  ? 'bg-earth-green/10 text-earth-green'
                  : 'bg-orange-500/10 text-orange-600 animate-pulse'
              }`}>
                {act.statusText || act.status}
              </span>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Withdraw Modal Drawer */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWithdrawOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-6 pb-8 border-t border-earth-green/10 shadow-2xl z-50 text-earth-dark"
            >
              <div className="w-12 h-1 bg-earth-green/10 rounded-full mx-auto mb-6" />

              <h3 className="text-lg font-bold mb-1">Instant UPI Cashout</h3>
              <p className="text-xs text-earth-muted mb-6">Funds will be instantly deposited into your verified bank account via IMPS/UPI network protocol.</p>

              <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-muted block mb-2">Withdrawal Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-earth-muted">₹</span>
                    <input
                      type="number"
                      max={balance}
                      min="1"
                      required
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full pl-8 pr-16 py-4 bg-earth-green/5 border border-earth-green/10 rounded-2xl font-black text-lg focus:outline-none focus:border-earth-green focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(balance.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-earth-green text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-earth-dark transition-all"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-[10px] text-earth-muted mt-2 flex justify-between px-1">
                    <span>Available: ₹{balance.toLocaleString('en-IN')}</span>
                    <span>Fee: ₹0 (Govt Subsidy)</span>
                  </p>
                </div>

                <div className="bg-earth-green/5 p-4 rounded-2xl border border-earth-green/10 flex items-start gap-3">
                  <Info className="w-4.5 h-4.5 text-earth-green shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold">Automatic Smart Settlement</h5>
                    <p className="text-[10px] text-earth-muted mt-0.5 leading-relaxed">
                      By submitting, you sign a smart contract trigger authorizing the sale / release of corresponding verified credits on CarbonX.
                    </p>
                  </div>
                </div>

                {success ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-earth-green/10 text-earth-green rounded-2xl text-center font-bold text-xs border border-earth-green/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-earth-green animate-bounce" />
                    <span>Payout Successful! Check Bank SMS.</span>
                  </motion.div>
                ) : (
                  <button
                    type="submit"
                    disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) > balance}
                    className="w-full py-4 rounded-2xl bg-earth-accent text-earth-dark font-black tracking-wider shadow-lg hover:bg-white hover:text-earth-green hover:border hover:border-earth-green transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {withdrawing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-earth-dark" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Initiating IMPS Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Transfer</span>
                        <ArrowUpRight className="w-4.5 h-4.5" />
                      </>
                    )}
                  </button>
                )}
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
