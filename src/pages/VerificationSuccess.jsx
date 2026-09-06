import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Calendar, ArrowRight, Cpu, FileText, Database } from 'lucide-react';

export default function VerificationSuccess() {
  const navigate = useNavigate();

  const steps = [
    { icon: FileText, title: '1. Land Deed Indexed', desc: 'Land record matching complete with PM-Kisan & Bhuvan Cadastral indices.' },
    { icon: Database, title: '2. Soil Baseline Scanned', desc: 'Historic NDVI calculations mapped back to 2023.' },
    { icon: Cpu, title: '3. Blockchain Credit Minting', desc: 'Sequestration results tokenized as ERC-1155 credits.' },
  ];

  return (
    <div className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white border border-forest-100 rounded-3xl p-8 shadow-card text-center">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={36} className="text-forest-700" />
          </div>
          <h2 className="text-xl font-manrope font-bold text-carbon-900">Verification Initiated</h2>
          <p className="text-xs text-carbon-500 mt-2 leading-relaxed">
            Your land records, bank connections, and biometric markers are securely saved.
          </p>
        </div>

        <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-card mt-4">
          <h3 className="text-sm font-bold text-carbon-900 mb-1 flex items-center gap-2">
            <Calendar size={16} className="text-forest-600" /> Satellite Pass & MRV Timeline
          </h3>
          <p className="text-[11px] text-carbon-500 mb-4 leading-relaxed">
            Our automated system checks your farm's soil organic carbon and canopy density during scheduled satellite orbits.
          </p>
          <div className="space-y-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-forest-50 text-forest-700 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-carbon-800">{s.title}</p>
                    <p className="text-[10px] text-carbon-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')} className="w-full mt-4 py-3.5 bg-forest-800 text-white rounded-2xl text-sm font-bold hover:bg-forest-900 transition-colors flex items-center justify-center gap-2">
          Continue to Dashboard <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
