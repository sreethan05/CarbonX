import React, { useState, useEffect, useRef } from 'react';
import { Satellite, Layers, MapPin, ZoomIn, ZoomOut, Eye, RefreshCw, Globe, Database } from 'lucide-react';

export default function GEESatelliteMap({ onAnalysisComplete, farmGeoJson, areaHectares }) {
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Google Earth Engine analysis types
  const analysisTypes = {
    ndvi: { name: 'NDVI', desc: 'Vegetation Health Index', color: 'green' },
    evi: { name: 'EVI', desc: 'Enhanced Vegetation Index', color: 'blue' },
    ndwi: { name: 'NDWI', desc: 'Water Content Index', color: 'cyan' },
    biodiversity: { name: 'Biodiversity', desc: 'Species Richness Estimate', color: 'purple' }
  };

  // Run GEE-style analysis simulation
  const runAnalysis = async (type) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate GEE processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate realistic analysis results based on area
      const baseNdvi = 0.5 + (areaHectares % 0.3);
      const analysisResults = {
        ndvi: {
          value: parseFloat((baseNdvi + Math.random() * 0.2).toFixed(3)),
          score: Math.round((baseNdvi + 0.2) * 100),
          interpretation: baseNdvi > 0.6 ? 'Healthy Vegetation' : baseNdvi > 0.3 ? 'Moderate Vegetation' : 'Sparse Vegetation',
          min: 0.42,
          max: 0.89,
          mean: parseFloat((baseNdvi + 0.1).toFixed(3))
        },
        evi: {
          value: parseFloat((baseNdvi * 0.8 + Math.random() * 0.15).toFixed(3)),
          score: Math.round((baseNdvi * 80) + 10),
          interpretation: 'Good vegetation density',
          min: 0.31,
          max: 0.72,
          mean: parseFloat((baseNdvi * 0.85).toFixed(3))
        },
        ndwi: {
          value: parseFloat((0.3 + Math.random() * 0.4).toFixed(3)),
          interpretation: 'Moderate water content',
          min: 0.12,
          max: 0.68,
          mean: 0.41
        },
        biodiversity: {
          score: Math.round(50 + (baseNdvi * 50) + (areaHectares * 5)),
          speciesEstimate: Math.round(areaHectares * 25 + Math.random() * 30),
          habitatQuality: baseNdvi > 0.5 ? 'Good' : 'Fair',
          rareSpeciesCount: Math.floor(Math.random() * 5)
        }
      };

      setAnalysisData(analysisResults[type] || analysisResults.ndvi);

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResults);
      }
    } catch (err) {
      setError('Failed to run satellite analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current analysis based on active layer
  const getCurrentAnalysis = () => {
    if (!analysisData) return null;
    
    const layerConfig = {
      ndvi: analysisData.ndvi,
      evi: analysisData.evi,
      ndwi: analysisData.ndwi,
      biodiversity: analysisData.biodiversity
    };
    
    return layerConfig[activeLayer] || null;
  };

  return (
    <div className="bg-white border border-forest-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">GEE Satellite Analysis</h3>
              <p className="text-white/60 text-[10px]">Google Earth Engine Integration</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => runAnalysis(activeLayer)}
              disabled={loading}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Satellite className="w-3.5 h-3.5" />
              )}
              Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Layer Selector */}
      <div className="p-4 border-b border-forest-100">
        <p className="text-[9px] font-bold text-carbon-400 uppercase tracking-wider mb-2">Select Analysis Layer</p>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(analysisTypes).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className={`p-2.5 rounded-xl text-center transition-all ${
                activeLayer === key 
                  ? `bg-${config.color}-100 border-2 border-${config.color}-400` 
                  : 'bg-forest-50 hover:bg-forest-100 border-2 border-transparent'
              }`}
            >
              <p className="text-[10px] font-bold">{config.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Map Area (Placeholder for actual GEE integration) */}
      <div className="relative h-64 bg-gradient-to-b from-blue-100 to-blue-200">
        {/* Placeholder satellite imagery */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Satellite className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-sm font-bold text-blue-800">Satellite Imagery</p>
            <p className="text-[10px] text-blue-600">Powered by Google Earth Engine</p>
          </div>
        </div>

        {/* Overlay with coordinates */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-2 rounded-xl">
          <p className="text-[9px] text-carbon-500">
            <MapPin className="w-3 h-3 inline mr-1" />
            {farmGeoJson?.coordinates?.[0]?.[0]?.[1]?.toFixed(4) || '17.9692'}°N, 
            {farmGeoJson?.coordinates?.[0]?.[0]?.[0]?.toFixed(4) || '79.5945'}°E
          </p>
        </div>

        {/* Area Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-2 rounded-xl">
          <p className="text-[10px] font-bold text-carbon-800">
            <Database className="w-3 h-3 inline mr-1" />
            {areaHectares || 4.28} Hectares
          </p>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-4 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-blue-800">Processing GEE Data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {error && (
        <div className="p-4 bg-rose-50 border-t border-rose-100 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {getCurrentAnalysis() && !loading && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-carbon-400 uppercase">Analysis Results</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
              {analysisTypes[activeLayer]?.name} Analysis
            </span>
          </div>

          {/* Value Display */}
          {getCurrentAnalysis().value !== undefined && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
              <p className="text-[9px] text-blue-600 font-bold uppercase mb-1">
                {analysisTypes[activeLayer]?.desc}
              </p>
              <p className="text-3xl font-black text-blue-900">
                {getCurrentAnalysis().value}
              </p>
              {getCurrentAnalysis().score !== undefined && (
                <p className="text-xs text-blue-600 mt-1">Score: {getCurrentAnalysis().score}/100</p>
              )}
            </div>
          )}

          {/* Biodiversity Special Display */}
          {activeLayer === 'biodiversity' && getCurrentAnalysis().speciesEstimate !== undefined && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-[9px] text-purple-600 font-bold">Species</p>
                <p className="text-lg font-black text-purple-900">{getCurrentAnalysis().speciesEstimate}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-[9px] text-purple-600 font-bold">Habitat</p>
                <p className="text-sm font-bold text-purple-900">{getCurrentAnalysis().habitatQuality}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-[9px] text-purple-600 font-bold">Rare Spp</p>
                <p className="text-lg font-black text-purple-900">{getCurrentAnalysis().rareSpeciesCount}</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-forest-50 rounded-xl p-2.5">
              <p className="text-[9px] text-carbon-400">Min</p>
              <p className="text-sm font-bold text-carbon-800">{getCurrentAnalysis().min || 'N/A'}</p>
            </div>
            <div className="bg-forest-50 rounded-xl p-2.5">
              <p className="text-[9px] text-carbon-400">Max</p>
              <p className="text-sm font-bold text-carbon-800">{getCurrentAnalysis().max || 'N/A'}</p>
            </div>
            <div className="bg-forest-50 rounded-xl p-2.5">
              <p className="text-[9px] text-carbon-400">Mean</p>
              <p className="text-sm font-bold text-carbon-800">{getCurrentAnalysis().mean || 'N/A'}</p>
            </div>
            <div className="bg-forest-50 rounded-xl p-2.5">
              <p className="text-[9px] text-carbon-400">Status</p>
              <p className="text-sm font-bold text-emerald-600">{getCurrentAnalysis().interpretation?.split(' ')[0] || 'Good'}</p>
            </div>
          </div>

          {/* Interpretation */}
          {getCurrentAnalysis().interpretation && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-[10px] text-blue-800">
                <strong>Interpretation:</strong> {getCurrentAnalysis().interpretation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Analysis Yet */}
      {!getCurrentAnalysis() && !loading && !error && (
        <div className="p-6 text-center">
          <Eye className="w-8 h-8 text-forest-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-carbon-600">No Analysis Data Yet</p>
          <p className="text-[10px] text-carbon-400 mt-1">
            Select a layer and click "Analyze" to run GEE satellite analysis
          </p>
        </div>
      )}
    </div>
  );
}