import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Tooltip, CircleMarker, LayersControl, ScaleControl, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Attempt to import turf for geodesic area calculations
let turf = null;
try {
  turf = require('@turf/turf');
} catch (e) {
  // Turf loaded via ES module or fallback
}

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

function MapClickHandler({ readOnly, polygonMode, polygonPoints, setPolygonPoints, polygonClosed, setPolygonClosed, setPolygonMode }) {
  useMapEvents({
    click(e) {
      if (readOnly || !polygonMode || polygonClosed) return;
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

// Calculate geodesic polygon area using turf or spherical fallback
function calculatePolygonAreaHa(pts) {
  if (!pts || pts.length < 3) return 0;

  try {
    const coords = [...pts.map(p => [p[1], p[0]]), [pts[0][1], pts[0][0]]];
    const poly = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] }
    };

    if (turf && turf.area) {
      const areaM2 = turf.area(poly);
      return Math.round((areaM2 / 10000) * 100) / 100;
    }
  } catch (err) {
    console.warn('Turf area calculation error, using spherical fallback', err);
  }

  // Spherical Shoelace Formula Fallback
  let areaDeg = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaDeg += pts[i][1] * pts[j][0] - pts[j][1] * pts[i][0];
  }
  const areaM2 = Math.abs(areaDeg) / 2 * (111320 ** 2) * Math.cos((pts[0][0] * Math.PI) / 180);
  return Math.round((areaM2 / 10000) * 100) / 100;
}

export default function LeafletMap({
  readOnly = false,
  initialPoints = null,
  center = null,
  placeLabel = '',
  subLabel = '',
  onGeojsonDrawn = null,
  onAreaCalculated = null,
  showHeatmapToggle = true,
  height = '60vh',
}) {
  const defaultPoints = [
    [17.383, 78.484],
    [17.383, 78.487],
    [17.386, 78.487],
    [17.386, 78.484],
  ];
  const [search, setSearch] = useState('');
  const [flyTo, setFlyTo] = useState(center || null);
  const [polygonMode, setPolygonMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState(initialPoints || defaultPoints);
  const [polygonClosed, setPolygonClosed] = useState(true);
  const [status, setStatus] = useState(readOnly ? '🔒 Cadastral Boundary Locked (Tier 1A)' : '');
  const [heatmapActive, setHeatmapActive] = useState(false);
  // Search result marker + reverse-geocoded place name so the map always
  // shows human-readable location context (village / mandal / district).
  const [searchMarker, setSearchMarker] = useState(null);
  const [placeName, setPlaceName] = useState('');

  // When verification supplies the exact registry/doc polygon, load it and
  // fly the map to its coordinates.
  useEffect(() => {
    if (initialPoints && initialPoints.length >= 3) {
      setPolygonPoints(initialPoints);
      setPolygonClosed(true);
      const lat = initialPoints.reduce((s, p) => s + p[0], 0) / initialPoints.length;
      const lng = initialPoints.reduce((s, p) => s + p[1], 0) / initialPoints.length;
      setFlyTo([lat, lng]);
      setStatus(readOnly ? '🔒 Cadastral Boundary Locked (Tier 1A)' : '📍 Exact record location marked — confirm or redraw');
    }
  }, [initialPoints, readOnly]);

  useEffect(() => {
    if (center && center.length === 2) setFlyTo(center);
  }, [center]);

  // Reverse-geocode the parcel centroid so a real place name
  // (village / town / mandal) is shown on the map, not just coordinates.
  useEffect(() => {
    const pts = polygonPoints.length >= 3 ? polygonPoints : (center || null);
    if (!pts) return;
    const lat = Array.isArray(pts[0])
      ? pts.reduce((s, p) => s + p[0], 0) / pts.length
      : pts[0];
    const lng = Array.isArray(pts[0])
      ? pts.reduce((s, p) => s + p[1], 0) / pts.length
      : pts[1];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    let cancelled = false;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        const addr = d.address || {};
        const named = addr.village || addr.town || addr.city || addr.suburb || addr.hamlet || addr.county || '';
        const label = [named, addr.state_district || addr.district || '', addr.state || ''].filter(Boolean).join(', ');
        setPlaceName(label || (d.display_name ? d.display_name.split(',').slice(0, 3).join(',') : ''));
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polygonPoints, center]);

  const emitGeojson = (pts) => {
    if (!pts || pts.length < 3) return;
    const coords = [...pts.map(p => [p[1], p[0]]), [pts[0][1], pts[0][0]]];
    const geojson = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] }
    };
    const ha = calculatePolygonAreaHa(pts);

    if (onGeojsonDrawn) onGeojsonDrawn(geojson);
    if (onAreaCalculated) onAreaCalculated({ area: ha, acres: Math.round(ha * 2.471 * 100) / 100, score: 84 });
  };

  useEffect(() => {
    if (polygonClosed && polygonPoints.length >= 3) {
      emitGeojson(polygonPoints);
    }
  }, [polygonClosed, polygonPoints]);

  const startPolygon = () => {
    if (readOnly) return;
    setPolygonMode(true);
    setPolygonPoints([]);
    setPolygonClosed(false);
    setStatus('Click map to draw farm vertices. Click near start point to close.');
    if (onGeojsonDrawn) onGeojsonDrawn(null);
  };

  const closePolygon = () => {
    if (polygonPoints.length >= 3) {
      setPolygonClosed(true);
      setPolygonMode(false);
      setStatus('Farm boundary closed!');
      emitGeojson(polygonPoints);
    } else {
      setStatus('Add at least 3 points first.');
    }
  };

  const clearAll = () => {
    if (readOnly) return;
    setPolygonPoints([]);
    setPolygonClosed(false);
    setPolygonMode(false);
    setStatus('');
    if (onGeojsonDrawn) onGeojsonDrawn(null);
    if (onAreaCalculated) onAreaCalculated({ area: 0, acres: 0, score: 0 });
  };

  const searchLocation = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setFlyTo([lat, lng]);
        setSearchMarker({ position: [lat, lng], name: data[0].display_name });
        setStatus(`Location found: ${data[0].display_name.split(',')[0]}`);
      } else {
        setStatus('Location not found.');
      }
    } catch {
      setStatus('Search failed.');
    }
  };

  const centroid = polygonPoints.length >= 3
    ? [
        polygonPoints.reduce((s, p) => s + p[0], 0) / polygonPoints.length,
        polygonPoints.reduce((s, p) => s + p[1], 0) / polygonPoints.length,
      ]
    : center;
  const currentAreaHa = polygonClosed ? calculatePolygonAreaHa(polygonPoints) : 0;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-forest-100 shadow-card" style={{ height, minHeight: 360 }}>
      <MapContainer
        center={center || (polygonPoints.length > 0 ? polygonPoints[0] : [17.385, 78.4867])}
        zoom={16}
        maxZoom={22}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
        <LayersControl position="topright">
          {/* Default: satellite WITH place/road labels so names are visible */}
          <LayersControl.BaseLayer checked name="Hybrid (places + labels)">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={22}
              attribution="&copy; Google · OSM contributors"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={22}
              attribution="&copy; Google Satellite"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Streets (place names)">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              attribution="&copy; OpenStreetMap contributors"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        {flyTo && <FlyToLocation position={flyTo} />}
        <MapClickHandler
          readOnly={readOnly}
          polygonMode={polygonMode}
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          polygonClosed={polygonClosed}
          setPolygonClosed={setPolygonClosed}
          setPolygonMode={setPolygonMode}
        />

        {polygonPoints.map((pt, i) => (
          <Marker key={i} position={pt}>
            <Popup>
              Vertex {i + 1} ({pt[0].toFixed(5)}, {pt[1].toFixed(5)})
            </Popup>
          </Marker>
        ))}

        {polygonPoints.length > 1 && !polygonClosed && (
          <Polyline
            positions={polygonPoints}
            pathOptions={{ color: '#1F7A4D', weight: 3, dashArray: '6,4' }}
          />
        )}

        {polygonClosed && polygonPoints.length >= 3 && (
          <Polygon
            positions={polygonPoints}
            pathOptions={
              heatmapActive
                ? { color: '#DC2626', fillColor: '#16A34A', fillOpacity: 0.55, weight: 3 }
                : { color: readOnly ? '#155435' : '#1F7A4D', fillColor: '#1F7A4D', fillOpacity: 0.3, weight: readOnly ? 4 : 3 }
            }
          >
            <Tooltip permanent direction="top" className="parcel-label">
              {placeLabel || 'Farm parcel'}{placeName ? ` · ${placeName.split(',')[0]}` : ''}
            </Tooltip>
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{placeLabel || 'Farm parcel'}</p>
                {subLabel && <p className="text-gray-600">{subLabel}</p>}
                {placeName && <p className="text-gray-600 mt-0.5">{placeName}</p>}
                {centroid && <p className="font-mono mt-0.5">{centroid[0].toFixed(5)}, {centroid[1].toFixed(5)}</p>}
              </div>
            </Popup>
          </Polygon>
        )}
        {centroid && (
          <CircleMarker center={centroid} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#1F7A4D', fillOpacity: 1 }}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{placeLabel || 'Parcel centre'}</p>
                {placeName && <p className="text-gray-600">{placeName}</p>}
              </div>
            </Popup>
          </CircleMarker>
        )}
        {searchMarker && (
          <Marker position={searchMarker.position}>
            <Popup>{searchMarker.name}</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Top Search bar */}
      <div className="absolute top-3 left-3 z-[1000] flex gap-2 w-[calc(100%-110px)] max-w-xs">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchLocation()}
          placeholder="Search village or Mandal..."
          className="flex-1 bg-white/95 backdrop-blur-sm border border-forest-200 rounded-xl px-3 py-1.5 text-xs text-carbon-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={searchLocation}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all shrink-0"
        >
          Go
        </button>
      </div>

      {/* Top Right Controls: NDVI Heatmap Toggle & ReadOnly Badge */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {showHeatmapToggle && (
          <button
            onClick={() => setHeatmapActive(!heatmapActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all border flex items-center gap-1.5 ${
              heatmapActive
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-white/95 text-carbon-800 border-forest-200 hover:bg-surface-sage'
            }`}
          >
            <span>🌱 NDVI Heatmap</span>
            {heatmapActive && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />}
          </button>
        )}
      </div>

      {/* Bottom Floating Live Turf Area Display */}
      {polygonClosed && currentAreaHa > 0 && (
        <div className="absolute bottom-16 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-forest-200 rounded-xl px-3 py-2 shadow-sm flex items-center gap-2 text-xs">
          <span className="font-semibold text-agriText-muted">Live Area:</span>
          <span className="font-mono font-bold text-primary">{currentAreaHa} ha</span>
          <span className="text-[10px] text-agriText-subtle">
            ({Math.round(currentAreaHa * 2.471 * 100) / 100} acres)
          </span>
        </div>
      )}

      {/* Drawing Toolbar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2">
        {!readOnly && !polygonMode && (
          <button
            onClick={startPolygon}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <span>⬠ Redraw Boundary</span>
          </button>
        )}

        {!readOnly && polygonMode && polygonPoints.length >= 3 && (
          <button
            onClick={closePolygon}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
          >
            ✓ Close Boundary
          </button>
        )}

        {!readOnly && (polygonPoints.length > 0 || polygonClosed) && (
          <button
            onClick={clearAll}
            className="bg-white/90 hover:bg-white border border-forest-200 text-carbon-800 text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all"
          >
            ✕ Clear
          </button>
        )}

        {readOnly && (
          <div className="bg-primary/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5">
            <span>🔒 Cadastral Boundary (Tier 1A Read-Only)</span>
          </div>
        )}
      </div>

      {/* Status Pill */}
      {status && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[1000] bg-carbon-900/80 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full shadow-md text-center">
          {status}
        </div>
      )}
    </div>
  );
}
