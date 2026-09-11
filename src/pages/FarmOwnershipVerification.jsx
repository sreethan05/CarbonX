import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleMarker, MapContainer, Polygon, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, FileText, Loader2, Lock, RefreshCw, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { verifyAadhaar, verifyLandDocument } from '../services/api';

const ACCEPTED = 'image/jpeg,image/png,application/pdf';
const LIMIT = 10 * 1024 * 1024;
const fileToBase64 = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });

function UploadZone({ label, file, onFile, disabled = false }) {
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  const choose = (candidate) => { if (!candidate) return; if (!['image/jpeg', 'image/png', 'application/pdf'].includes(candidate.type)) return onFile(null, 'Upload a JPG, PNG, or PDF.'); if (candidate.size > LIMIT) return onFile(null, 'File must be smaller than 10 MB.'); onFile(candidate); };
  return <div onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files?.[0]); }} onClick={() => !disabled && input.current?.click()} className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition ${dragging ? 'border-forest-600 bg-forest-50' : 'border-forest-200 bg-warm-white'} ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-forest-500'}`}>
    <input ref={input} className="hidden" type="file" accept={ACCEPTED} disabled={disabled} onChange={(event) => choose(event.target.files?.[0])} />
    {file ? <div className="flex items-center gap-3 text-left"><CheckCircle2 className="shrink-0 text-forest-600" /><div className="min-w-0"><p className="truncate text-xs font-bold text-carbon-800">{file.name}</p><p className="text-[10px] text-forest-700">Ready to verify</p></div></div> : <><Upload className="mx-auto mb-2 text-forest-500" size={25} /><p className="text-xs font-bold text-carbon-800">{label}</p><p className="mt-1 text-[10px] text-carbon-400">Tap or drag JPG, PNG, or PDF · max 10 MB</p></>}
  </div>;
}

function PahaniMap({ geojson }) {
  const ring = geojson?.geometry?.coordinates?.[0] || [];
  if (ring.length < 3) return null;
  const positions = ring.map(([lng, lat]) => [lat, lng]);
  return <div className="h-64 overflow-hidden rounded-2xl border border-forest-200"><MapContainer center={positions[0]} zoom={16} className="h-full w-full"><TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution="© Google" /><Polygon positions={positions} pathOptions={{ color: '#167044', weight: 3, fillColor: '#42b96a', fillOpacity: 0.25 }} />{positions.slice(0, -1).map((position, index) => <CircleMarker key={index} center={position} radius={5} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#167044', fillOpacity: 1 }} />)}</MapContainer></div>;
}

export default function FarmOwnershipVerification() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [land, setLand] = useState(null);
  const [aadhaarResult, setAadhaarResult] = useState(null);
  const [landResult, setLandResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const aadhaarLocked = attempts >= 3 && !aadhaarResult?.verified;
  const aadhaarReady = aadhaarResult?.verified;

  const attach = (setter) => (file, validationError) => { setError(validationError || ''); if (file) setter(file); };
  const verifyIdentity = async () => {
    if (!front || !back) return setError('Upload both Aadhaar front and Aadhaar back.');
    setLoading(true); setError('');
    try {
      const result = await verifyAadhaar({ front_image: await fileToBase64(front), back_image: await fileToBase64(back), front_content_type: front.type, back_content_type: back.type });
      setAadhaarResult(result);
      if (!result.verified) setAttempts((value) => value + 1);
      if (result.verified) setStep(2);
      else setError(result.reasons?.join('. ') || result.message || 'Aadhaar verification failed.');
    } catch { setError('Could not verify Aadhaar. Please try again.'); } finally { setLoading(false); }
  };
  const verifyLand = async () => {
    if (!land) return setError('Upload your Pahani land record. It is required for farmer verification.');
    setLoading(true); setError('');
    try {
      const result = await verifyLandDocument({ document_name: land.name, pahani_file: await fileToBase64(land), document_content_type: land.type });
      setLandResult(result);
      if (!result.success) setError(result.message || 'Land verification failed.');
      await refreshUser();
    } catch { setError('Could not verify your Pahani. Please retry or contact your FPO.'); } finally { setLoading(false); }
  };
  const confirmLand = () => navigate('/farm-details', { state: { cropType: landResult?.extracted?.crop, irrigation: landResult?.extracted?.irrigation } });
  const failed = landResult?.failed_checks || landResult?.reasons || [];
  const verified = landResult?.status === 'VERIFIED';

  return <div className="mx-auto max-w-2xl px-4 pb-24 pt-6"><header className="mb-5 flex items-center gap-3"><button onClick={() => navigate('/dashboard')} className="rounded-xl border border-forest-100 bg-white p-2 text-carbon-600"><ArrowLeft size={18} /></button><div><h1 className="font-manrope text-lg font-extrabold text-carbon-900">KYC verification</h1><p className="text-[11px] text-carbon-500">Secure identity and Pahani verification</p></div></header>
    <div className="mb-6 flex items-center gap-2">{[1,2].map((number) => <div key={number} className="flex flex-1 items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${step >= number ? 'bg-forest-700 text-white' : 'bg-forest-100 text-carbon-400'}`}>{aadhaarReady && number === 1 ? <CheckCircle2 size={15} /> : number}</span><span className="text-[11px] font-bold text-carbon-600">Step {number} of 2</span>{number === 1 && <span className="h-1 flex-1 rounded bg-forest-100"><span className={`block h-1 rounded bg-forest-600 ${step === 2 ? 'w-full' : 'w-0'}`} /></span>}</div>)}</div>
    {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</div>}
    <AnimatePresence mode="wait">
      {step === 1 && <motion.section key="aadhaar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-forest-100 bg-white p-6 shadow-card"><div className="mb-5"><ShieldCheck className="mb-3 text-forest-700" /><h2 className="font-manrope text-xl font-extrabold">Step 1: Aadhaar verification</h2><p className="mt-1 text-xs text-carbon-500">Upload both sides. Your registered name and Aadhaar last four digits must match.</p></div>{aadhaarLocked ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center"><Lock className="mx-auto mb-2 text-rose-600" /><p className="text-sm font-bold text-rose-800">Verification failed after 3 attempts.</p><p className="mt-1 text-xs text-rose-700">Please contact your FPO for assistance.</p></div> : <><div className="grid gap-3 sm:grid-cols-2"><UploadZone label="Upload Aadhaar Front" file={front} onFile={attach(setFront)} /><UploadZone label="Upload Aadhaar Back" file={back} onFile={attach(setBack)} /></div>{aadhaarResult && <div className={`mt-4 rounded-xl p-3 text-xs font-semibold ${aadhaarResult.verified ? 'bg-forest-50 text-forest-800' : 'bg-rose-50 text-rose-700'}`}>{aadhaarResult.verified ? 'Aadhaar verified. Step 2 is unlocked.' : `Attempt ${attempts} of 3. ${aadhaarResult.reasons?.join('. ')}`}</div>}<button disabled={loading} onClick={verifyIdentity} className="mt-5 w-full rounded-2xl bg-forest-800 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <><Loader2 className="mr-2 inline animate-spin" size={16} />Verifying...</> : 'Verify Aadhaar'}</button></>}</motion.section>}
      {step === 2 && <motion.section key="land" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-forest-100 bg-white p-6 shadow-card"><div className="mb-5"><FileText className="mb-3 text-forest-700" /><h2 className="font-manrope text-xl font-extrabold">Step 2: Land verification</h2><p className="mt-1 text-xs text-carbon-500">Upload your Pahani (land record). It is mandatory for farmers. For help obtaining it, contact your FPO.</p></div>{!landResult && <><UploadZone label="Upload your Pahani — required" file={land} onFile={attach(setLand)} /><button disabled={loading || !land} onClick={verifyLand} className="mt-5 w-full rounded-2xl bg-forest-800 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <><Loader2 className="mr-2 inline animate-spin" size={16} />Reading Pahani...</> : 'Verify land record'}</button></>}{landResult && <div className="space-y-4"><div className={`rounded-2xl border p-4 ${verified ? 'border-forest-200 bg-forest-50' : 'border-rose-200 bg-rose-50'}`}><div className="flex gap-3"><div className={verified ? 'text-forest-600' : 'text-rose-600'}>{verified ? <CheckCircle2 /> : <AlertTriangle />}</div><div><p className="text-sm font-extrabold">{verified ? `${landResult.badge || 'DOCUMENT'} verification complete` : 'Verification pending review'}</p><p className="mt-1 text-xs">{verified ? 'Crop and irrigation were extracted from your Pahani.' : 'Your verification has been flagged for review. Your FPO will contact you.'}</p></div></div></div>{verified && <PahaniMap geojson={landResult.polygon_geojson} />}{landResult.extracted && <div className="grid grid-cols-2 gap-2 rounded-2xl border border-forest-100 bg-warm-white p-4 text-xs">{[['Survey',landResult.extracted.survey_no],['Owner',landResult.extracted.owner_name],['Area',landResult.extracted.area_acres ? `${landResult.extracted.area_acres} acres` : landResult.extracted.area_hectares && `${landResult.extracted.area_hectares} ha`],['Crop',landResult.extracted.crop],['Irrigation',landResult.extracted.irrigation],['Village',landResult.extracted.village]].map(([key,value]) => <div key={key}><p className="text-[9px] font-bold uppercase text-carbon-400">{key}</p><p className="font-semibold text-carbon-800">{value || 'Not found'}</p></div>)}</div>}{!verified && failed.length > 0 && <ul className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{failed.map((item) => <li key={item} className="mb-1 flex gap-2"><AlertTriangle size={13} />{String(item).replaceAll('_',' ')}</li>)}</ul>}<div className="grid grid-cols-2 gap-3">{verified ? <button onClick={confirmLand} className="col-span-2 rounded-2xl bg-forest-800 py-4 text-sm font-bold text-white">Is this your land? Confirm <ArrowRight className="inline" size={15} /></button> : <button onClick={() => { setLandResult(null); setLand(null); }} className="rounded-2xl border border-rose-200 bg-white py-3 text-xs font-bold text-rose-700"><RefreshCw className="mr-1 inline" size={14} />Re-upload</button>}<button onClick={() => navigate('/dashboard')} className={`${verified ? 'col-span-2' : ''} rounded-2xl border border-forest-100 bg-white py-3 text-xs font-bold text-carbon-700`}>Back to dashboard</button></div></div>}</motion.section>}
    </AnimatePresence>
  </div>;
}
