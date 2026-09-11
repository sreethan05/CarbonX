import { forwardRef, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2, Loader2, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { registerUser, sendOtp, verifyRegistrationOtp } from '../services/api';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli and Daman & Diu','Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry'];
const TELANGANA_DISTRICTS = ['Adilabad','Bhadradri Kothagudem','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalpally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Komaram Bheem Asifabad','Mahabubabad','Mahabubnagar','Mancherial','Medak','Medchal Malkajgiri','Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Rangareddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal Rural','Warangal Urban','Yadadri Bhuvanagiri'];

function validAadhaar(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 12) return false;
  const d = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
  const p = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
  return digits.split('').reverse().reduce((check, digit, index) => d[check][p[index % 8][Number(digit)]], 0) === 0;
}
const Input = forwardRef(({ invalid, ...props }, ref) => <input ref={ref} {...props} className={`w-full rounded-xl border bg-forest-50 p-3 text-sm font-semibold text-carbon-800 outline-none focus:border-forest-600 focus:bg-white ${invalid ? 'border-rose-400' : 'border-forest-100'} ${props.className || ''}`} />);
Input.displayName = 'Input';
const Label = ({ children }) => <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-carbon-500">{children}</label>;

export default function FarmerRegister() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { currentLang, changeLanguage } = useLanguage();
  const { login } = useAuth();
  const otpRefs = useRef([]);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [otpToken, setOtpToken] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resend, setResend] = useState(0);
  const [form, setForm] = useState({ name: '', aadhaar: '', state: 'Telangana', district: '', village: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const role = params.get('role') || 'farmer';
  const phoneOk = /^[6-9]\d{9}$/.test(phone);
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const move = (nextStep) => { setError(''); setStep(nextStep); };

  useEffect(() => {
    if (!resend) return undefined;
    const interval = setInterval(() => setResend((value) => Math.max(value - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [resend]);

  const requestOtp = async () => {
    if (!phoneOk) return setError('Enter a valid 10-digit Indian mobile number.');
    setLoading(true); setError('');
    try {
      const result = await sendOtp(phone);
      if (!result.success) return setError(result.message || 'Could not send OTP.');
      setDevOtp(result.dev_otp || ''); setOtp(Array(6).fill('')); setResend(60); move(3);
    } catch { setError('Could not reach the server.'); } finally { setLoading(false); }
  };
  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) return setError('Enter all 6 OTP digits.');
    setLoading(true); setError('');
    try {
      const result = await verifyRegistrationOtp(phone, code);
      if (!result.success || !result.verification_token) return setError(result.message || 'OTP verification failed.');
      setOtpToken(result.verification_token); move(4);
    } catch { setError('Could not verify OTP.'); } finally { setLoading(false); }
  };
  const updateOtp = (index, value) => {
    const copy = [...otp]; copy[index] = value.replace(/\D/g, '').slice(-1); setOtp(copy);
    if (copy[index] && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const submitIdentity = () => {
    if (!form.name.trim()) return setError('Type your name exactly as printed on Aadhaar.');
    if (!validAadhaar(form.aadhaar)) return setError('Enter a valid 12-digit Aadhaar number.');
    move(5);
  };
  const submitLocation = () => {
    if (!form.district.trim() || !form.village.trim()) return setError('Enter district and village.');
    move(6);
  };
  const submitEmail = () => {
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email or leave it empty.');
    move(7);
  };
  const finish = async () => {
    setLoading(true); setError('');
    try {
      const result = await registerUser({ phone, otp: otp.join(''), otp_verification_token: otpToken, ...form, upi: '', role, preferred_language: currentLang });
      if (!result.success) return setError(result.message || 'Could not create account.');
      await login(result.token, result.user); navigate('/dashboard');
    } catch { setError('Could not create account.'); } finally { setLoading(false); }
  };
  const card = (children) => <motion.section key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="rounded-3xl border border-forest-100 bg-white p-6 shadow-card">{children}</motion.section>;
  const button = 'w-full rounded-2xl bg-forest-800 py-4 text-sm font-bold text-white transition hover:bg-forest-900 disabled:opacity-60';

  return <div className="min-h-screen bg-warm-white px-4 py-6 text-carbon-800"><main className="mx-auto max-w-md">
    <header className="mb-6 flex items-center justify-between"><button onClick={() => step === 1 ? navigate('/') : setStep((value) => value - 1)} className="rounded-xl p-2 text-carbon-600 hover:bg-forest-50"><ArrowLeft size={19} /></button><strong className="font-manrope text-lg text-forest-800">CarbonX</strong><div className="flex items-center gap-1 rounded-xl border border-forest-100 bg-forest-50 px-2 py-1"><Globe2 size={13} /><select value={currentLang} onChange={(event) => changeLanguage(event.target.value)} className="bg-transparent text-xs font-bold outline-none"><option value="en">English</option><option value="hi">हिन्दी</option><option value="te">తెలుగు</option></select></div></header>
    <div className="mb-2 flex justify-between text-xs font-bold text-carbon-500"><span>Step {step} of 7</span><span>{Math.round(step * 100 / 7)}%</span></div><div className="mb-5 h-2 overflow-hidden rounded-full bg-forest-100"><motion.div animate={{ width: `${step * 100 / 7}%` }} className="h-full bg-forest-600" /></div>
    {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</div>}
    <AnimatePresence mode="wait">
      {step === 1 && card(<div className="space-y-5 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-100 text-forest-700"><Globe2 size={28} /></div><div><h1 className="font-manrope text-2xl font-extrabold">Choose your language</h1><p className="mt-1 text-xs text-carbon-500">You can change this later.</p></div>{[['te','తెలుగు','Telugu'],['hi','हिन्दी','Hindi'],['en','English','English']].map(([code,label,sub]) => <button key={code} onClick={() => { changeLanguage(code); move(2); }} className="block w-full rounded-2xl border border-forest-100 p-4 text-left hover:border-forest-500 hover:bg-forest-50"><b>{label}</b><span className="block text-xs text-carbon-500">{sub}</span></button>)}</div>)}
      {step === 2 && card(<div className="space-y-5"><Phone className="text-forest-700" /><div><h1 className="font-manrope text-xl font-extrabold">Verify mobile number</h1><p className="mt-1 text-xs text-carbon-500">We will send a 6-digit OTP.</p></div><div><Label>Mobile number</Label><div className="flex gap-2"><span className="rounded-xl bg-forest-100 px-3 py-3 text-sm font-bold">+91</span><Input autoFocus invalid={phone && !phoneOk} inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" /></div></div><button disabled={loading} onClick={requestOtp} className={button}>{loading ? <Loader2 className="mx-auto animate-spin" size={17} /> : <>Send OTP <ArrowRight className="inline" size={15} /></>}</button></div>)}
      {step === 3 && card(<div className="space-y-5"><ShieldCheck className="text-forest-700" /><div><h1 className="font-manrope text-xl font-extrabold">Enter OTP</h1><p className="mt-1 text-xs text-carbon-500">Sent to +91 {phone}</p></div>{devOtp && <button onClick={() => setOtp(devOtp.split(''))} className="w-full rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs font-bold text-amber-800">Demo OTP: {devOtp} — tap to fill</button>}<div className="flex justify-between gap-2">{otp.map((value, index) => <Input key={index} ref={(node) => { otpRefs.current[index] = node; }} inputMode="numeric" maxLength={1} value={value} onChange={(e) => updateOtp(index, e.target.value)} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[index] && index) otpRefs.current[index - 1]?.focus(); }} className="h-12 w-11 p-0 text-center text-lg" />)}</div><button disabled={loading} onClick={verifyOtp} className={button}>{loading ? <Loader2 className="mx-auto animate-spin" size={17} /> : 'Verify & continue'}</button><button disabled={resend > 0} onClick={requestOtp} className="w-full text-xs font-bold text-forest-700 disabled:text-carbon-400">{resend ? `Resend OTP in ${resend}s` : 'Resend OTP'}</button></div>)}
      {step === 4 && card(<div className="space-y-5"><User className="text-forest-700" /><div><h1 className="font-manrope text-xl font-extrabold">Aadhaar and name</h1><p className="mt-1 text-xs text-carbon-500">Type the exact name on your Aadhaar. This is your verification anchor.</p></div><div><Label>Full name as on Aadhaar</Label><Input value={form.name} onChange={(e) => update('name', e.target.value)} /></div><div><Label>Aadhaar number</Label><Input invalid={form.aadhaar && !validAadhaar(form.aadhaar)} inputMode="numeric" value={form.aadhaar.replace(/(\d{4})(?=\d)/g, '$1-')} onChange={(e) => update('aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="XXXX-XXXX-XXXX" /><p className="mt-1 text-[10px] text-carbon-400">Only the last four digits are stored.</p></div><button onClick={submitIdentity} className={button}>Continue <ArrowRight className="inline" size={15} /></button></div>)}
      {step === 5 && card(<div className="space-y-4"><MapPin className="text-forest-700" /><div><h1 className="font-manrope text-xl font-extrabold">Farm location</h1><p className="mt-1 text-xs text-carbon-500">This must match your Pahani.</p></div><div><Label>State</Label><select value={form.state} onChange={(e) => { update('state', e.target.value); update('district', ''); }} className="w-full rounded-xl border border-forest-100 bg-forest-50 p-3 text-sm font-semibold">{STATES.map((state) => <option key={state}>{state}</option>)}</select></div><div><Label>District</Label>{form.state === 'Telangana' ? <select value={form.district} onChange={(e) => update('district',e.target.value)} className="w-full rounded-xl border border-forest-100 bg-forest-50 p-3 text-sm font-semibold"><option value="">Select district</option>{TELANGANA_DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select> : <><Input value={form.district} onChange={(e) => update('district',e.target.value)} /><p className="mt-1 text-[10px] text-carbon-400">Type your district outside Telangana.</p></>}</div><div><Label>Village</Label><Input value={form.village} onChange={(e) => update('village',e.target.value)} /></div><button onClick={submitLocation} className={button}>Continue <ArrowRight className="inline" size={15} /></button></div>)}
      {step === 6 && card(<div className="space-y-5"><Mail className="text-forest-700" /><div><h1 className="font-manrope text-xl font-extrabold">Email <span className="text-sm font-medium text-carbon-400">(optional)</span></h1><p className="mt-1 text-xs text-carbon-500">For account and verification updates.</p></div><div><Label>Email address</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="farmer@example.com" /></div><button onClick={submitEmail} className={button}>Continue <ArrowRight className="inline" size={15} /></button><button onClick={() => { update('email',''); move(7); }} className="w-full text-xs font-bold text-carbon-500">Skip for now</button></div>)}
      {step === 7 && card(<div className="space-y-5"><CheckCircle2 className="text-forest-700" /><div><h1 className="font-manrope text-xl font-extrabold">Confirm your account</h1><p className="mt-1 text-xs text-carbon-500">Review before creating your account.</p></div><dl className="divide-y divide-forest-100 rounded-2xl border border-forest-100 bg-forest-50/30 px-4">{[['Phone',phone],['Aadhaar',`XXXX-XXXX-${form.aadhaar.slice(-4)}`],['Name',form.name],['State',form.state],['District',form.district],['Village',form.village],['Email',form.email || 'Not provided']].map(([label,value]) => <div key={label} className="flex justify-between gap-3 py-3 text-xs"><dt className="font-semibold text-carbon-500">{label}</dt><dd className="text-right font-bold">{value}</dd></div>)}</dl><button disabled={loading} onClick={finish} className={button}>{loading ? <Loader2 className="mx-auto animate-spin" size={17} /> : 'Confirm and create account'}</button></div>)}
    </AnimatePresence>
  </main></div>;
}
