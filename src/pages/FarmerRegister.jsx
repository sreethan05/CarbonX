import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Volume2, Phone, ShieldCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function FarmerRegister() {
  const navigate = useNavigate();
  const { currentLang } = useLanguage();
  const { login } = useAuth();

  // Voice Assistance Simulation
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState('Govt Aadhaar ID');
  const [rawIdNumber, setRawIdNumber] = useState('');
  const [maskedId, setMaskedId] = useState('');
  const [district, setDistrict] = useState('Yadadri Bhuvanagiri');
  const [mandal, setMandal] = useState('Pochampally');
  const [village, setVillage] = useState('Pochampally');

  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes timer
  const [timerActive, setTimerActive] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    let interval = null;
    if (timerActive && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    } else if (otpTimer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, otpTimer]);

  const handleMicClick = () => {
    setIsListening(true);
    setSpeechText(currentLang === 'te' ? 'నమస్కారం! మీ పేరు మరియు వివరాలు మాట్లాడండి...' : 'Listening... Speak your legal name and village.');
    setTimeout(() => {
      setIsListening(false);
      setName('K. Ramesh');
      setPhone('9876543210');
      setMandal('Pochampally');
      setVillage('Pochampally');
      setSpeechText(currentLang === 'te' ? 'వాయిస్ గుర్తింపు పూర్తయింది: K. Ramesh (Pochampally)' : 'Voice input captured: K. Ramesh (Pochampally)');
    }, 2500);
  };

  const handleIdChange = (val) => {
    setRawIdNumber(val);
    if (val.length >= 4) {
      const last4 = val.slice(-4);
      setMaskedId(`XXXX-XXXX-[${last4} Redacted]`);
    } else {
      setMaskedId(val);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    setShowOtpModal(true);
    setTimerActive(true);
    setOtpTimer(600);
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6 && otp !== '123456') {
      setOtpError('Invalid 6-digit OTP code');
      return;
    }

    const userData = {
      name,
      phone,
      district,
      mandal,
      village,
      role: 'farmer',
      aadhaar_last4: rawIdNumber.slice(-4) || '3210'
    };

    login('cx_token_' + Date.now(), userData);
    setShowOtpModal(false);
    navigate('/farmer/land-verification');
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] font-inter text-slate-900 py-8 px-4 md:px-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header Title */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Farmer Onboarding Portal
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 font-manrope">Voice & OTP Farmer Registration</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automated identity onboarding for Telangana carbon credit enrollment.</p>
          </div>
          <ShieldCheck className="w-10 h-10 text-emerald-700" />
        </div>

        {/* Voice Assistance Bar */}
        <div className="bg-[#1B4332] text-white border border-emerald-900 shadow-sm rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleMicClick}
              type="button"
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isListening ? 'bg-rose-600 animate-pulse text-white' : 'bg-[#2D6A4F] hover:bg-[#40916C] text-white'
              }`}
            >
              <Mic className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  {currentLang === 'te' ? 'వాయిస్ సహాయం (Telugu / Eng)' : 'Voice-First Input Guidance'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {speechText || (currentLang === 'te' ? 'మైక్ క్లిక్ చేసి మాట్లాడండి' : 'Click mic to speak your name, village & details')}
              </p>
            </div>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmitForm} className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Legal Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. K. Ramesh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (+91)</label>
              <input
                type="text"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Identification Proof Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                <option value="Govt Aadhaar ID">Govt Aadhaar ID</option>
                <option value="Farmer Passbook ID">Telangana Farmer Passbook ID</option>
                <option value="Masked Government ID">Masked Government ID</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Identification Number (Masked)</label>
              <input
                type="text"
                required
                placeholder="Enter ID (e.g. 123456783210)"
                value={rawIdNumber}
                onChange={(e) => handleIdChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
              />
              {maskedId && (
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Privacy Masked Output: {maskedId}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                <option value="Yadadri Bhuvanagiri">Yadadri Bhuvanagiri</option>
                <option value="Warangal">Warangal</option>
                <option value="Jangaon">Jangaon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mandal</label>
              <input
                type="text"
                value={mandal}
                onChange={(e) => setMandal(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Village Name</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            <span>Generate Twilio OTP Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Twilio OTP Verification Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-[#1B4332]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900">Twilio OTP Verification</h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  {formatTimer(otpTimer)}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                A 6-digit authentication code has been dispatched to <span className="font-bold text-slate-900">+91 {phone}</span>.
              </p>

              {otpError && (
                <p className="text-xs text-rose-700 font-bold bg-rose-50 border border-rose-200 p-2 rounded">
                  {otpError}
                </p>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-600 flex justify-between items-center">
                  <span>Demo Mode Bypass Code: <strong className="font-mono text-emerald-800">123456</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp('123456')}
                    className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded"
                  >
                    Autofill
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 flex items-center justify-center gap-1"
                  >
                    <span>Verify & Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
