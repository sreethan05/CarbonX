import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 1.5 });
  }, [position, map]);
  return null;
}

function MapClickHandler({ polygonMode, polygonPoints, setPolygonPoints, polygonClosed, setPolygonClosed, setPolygonMode }) {
  useMapEvents({
    click(e) {
      if (!polygonMode || polygonClosed) return;
      const latlng = [e.latlng.lat, e.latlng.lng];
      if (polygonPoints.length >= 3) {
        const first = polygonPoints[0];
        const dist = Math.sqrt(Math.pow(latlng[0] - first[0], 2) + Math.pow(latlng[1] - first[1], 2));
        if (dist < 0.0005) {
          setPolygonClosed(true);
          setPolygonMode(false);
          return;
        }
      }
      setPolygonPoints(prev => [...prev, latlng]);
    }
  });
  return null;
}

export default function LeafletMap({ onGeojsonDrawn, onAreaCalculated }) {
  const [search, setSearch] = useState('');
  const [flyTo, setFlyTo] = useState(null);
  const [polygonMode, setPolygonMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polygonClosed, setPolygonClosed] = useState(false);
  const [status, setStatus] = useState('');

  const startPolygon = () => {
    setPolygonMode(true);
    setPolygonPoints([]);
    setPolygonClosed(false);
    setStatus('Click on the map to add boundary points. Click near the first point to close.');
    if (onGeojsonDrawn) onGeojsonDrawn(null);
  };

  const closePolygon = () => {
    if (polygonPoints.length >= 3) {
      setPolygonClosed(true);
      setPolygonMode(false);
      setStatus('Boundary closed! Click "Scan AI" to analyze.');
      emitGeojson(polygonPoints);
    } else {
      setStatus('Add at least 3 points first.');
    }
  };

  const clearAll = () => {
    setPolygonPoints([]);
    setPolygonClosed(false);
    setPolygonMode(false);
    setStatus('');
    if (onGeojsonDrawn) onGeojsonDrawn(null);
    if (onAreaCalculated) onAreaCalculated({ area: 0, score: 0, ndvi: 0 });
  };

  const emitGeojson = (pts) => {
    const coords = [...pts.map(p => [p[1], p[0]]), [pts[0][1], pts[0][0]]];
    const geojson = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] }
    };
    if (onGeojsonDrawn) onGeojsonDrawn(geojson);
    if (onAreaCalculated) {
      let areaDeg = 0;
      const n = pts.length;
      for (let i = 0; i < n - 1; i++) {
        areaDeg += pts[i][1] * pts[i + 1][0] - pts[i + 1][1] * pts[i][0];
      }
      const areaM2 = Math.abs(areaDeg) / 2 * (111320 ** 2) * Math.cos((pts[0][0] * Math.PI) / 180);
      const ha = Math.round(areaM2 / 10000 * 100) / 100;
      onAreaCalculated({ area: ha, score: 0, ndvi: 0 });
    }
  };

  useEffect(() => {
    if (polygonClosed && polygonPoints.length >= 3) {
      emitGeojson(polygonPoints);
    }
  }, [polygonClosed]);

  const searchLocation = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.length > 0) {
        setFlyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setStatus(`Found: ${data[0].display_name.split(',')[0]}`);
      } else {
        setStatus('Location not found.');
      }
    } catch {
      setStatus('Search failed.');
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-forest-100 shadow-lg" style={{ height: '65vh', minHeight: 340 }}>
      <MapContainer
        center={[17.385, 78.4867]}
        zoom={13}
        maxZoom={22}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={22}
          attribution="&copy; Google Satellite"
        />
        {flyTo && <FlyToLocation position={flyTo} />}
        <MapClickHandler
          polygonMode={polygonMode}
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          polygonClosed={polygonClosed}
          setPolygonClosed={setPolygonClosed}
          setPolygonMode={setPolygonMode}
        />

        {polygonPoints.map((pt, i) => (
          <Marker key={i} position={pt}>
            <Popup>Point {i + 1}</Popup>
          </Marker>
        ))}

        {polygonPoints.length > 1 && !polygonClosed && (
          <Polyline
            positions={polygonPoints}
            pathOptions={{ color: '#22c55e', weight: 3, dashArray: '6,4' }}
          />
        )}

        {polygonClosed && (
          <Polygon
            positions={polygonPoints}
            pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.25, weight: 3 }}
          />
        )}
      </MapContainer>

      {/* Search bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 w-[90%] max-w-sm">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchLocation()}
          placeholder="Search village or district..."
          className="flex-1 bg-white/95 backdrop-blur-sm border border-forest-100 rounded-xl px-3 py-2 text-xs text-carbon-800 shadow-md focus:outline-none focus:ring-1 focus:ring-forest-400 placeholder:text-carbon-400"
        />
        <button
          onClick={searchLocation}
          className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-all"
        >
          Go
        </button>
      </div>

      {/* Drawing toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
        {!polygonMode && !polygonClosed && (
          <button
            onClick={startPolygon}
            className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            ⬠ Draw Farm
          </button>
        )}
        {polygonMode && polygonPoints.length >= 3 && (
          <button
            onClick={closePolygon}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            ✓ Close Boundary
          </button>
        )}
        {polygonMode && (
          <div className="bg-black/60 text-white text-[10px] px-3 py-2 rounded-xl shadow-md max-w-[160px] text-center leading-tight">
            {polygonPoints.length === 0 ? 'Tap map to start' : `${polygonPoints.length} pts — tap first point to close`}
          </div>
        )}
        {(polygonPoints.length > 0 || polygonClosed) && (
          <button
            onClick={clearAll}
            className="bg-white/90 hover:bg-white border border-forest-100 text-carbon-700 text-xs font-bold px-3 py-2.5 rounded-xl shadow-md transition-all"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Status pill */}
      {status && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-black/70 text-white text-[10px] px-3 py-1.5 rounded-full shadow-md max-w-[280px] text-center">
          {status}
        </div>
      )}

      {/* Satellite badge */}
      <div className="absolute bottom-4 right-3 z-[1000]">
        <span className="bg-black/60 text-white text-[9px] px-2 py-1 rounded-lg font-mono">
          🛰️ Google Satellite
        </span>
      </div>
    </div>
  );
}
