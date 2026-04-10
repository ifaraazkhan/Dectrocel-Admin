import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, MapPin, Search, X, RefreshCw } from 'lucide-react';
import { reportsAPI } from '../../api/reports';
import { ctLicensesAPI } from '../../api/ctAdmin';
import toast from 'react-hot-toast';

// Fix Leaflet default marker icons (Vite/webpack bundling issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const highlightedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Pans the map when a license is selected via search
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
};

const STATUS_BADGE = {
  Available: 'bg-green-100 text-green-800',
  'In Use':  'bg-blue-100 text-blue-800',
  Revoked:   'bg-red-100 text-red-800',
  Expired:   'bg-gray-100 text-gray-600',
  'Carried Forward': 'bg-yellow-100 text-yellow-800',
  A: 'bg-green-100 text-green-800',
  U: 'bg-blue-100 text-blue-800',
  R: 'bg-red-100 text-red-800',
  E: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL = { A: 'Available', U: 'In Use', R: 'Revoked', E: 'Expired' };

const SCOPE_LABEL = {
  xray: 'X-ray',
  ct:   'CT',
  both: 'CT + X-ray',
};

const SCOPE_BADGE = {
  xray: 'bg-purple-50 text-purple-700',
  ct:   'bg-blue-50 text-blue-700',
  both: 'bg-teal-50 text-teal-700',
};

const SCOPE_OPTIONS = [
  { value: 'all',  label: 'All Licenses' },
  { value: 'xray', label: 'X-ray' },
  { value: 'ct',   label: 'CT Only' },
  { value: 'both', label: 'Both (CT + X-ray)' },
];

const LicenseMapReport = () => {
  const navigate = useNavigate();

  const [allLicenses, setAllLicenses] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [scopeFilter, setScopeFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter]     = useState(null);
  const searchRef = useRef(null);

  const fetchLicenses = async () => {
    try {
      setLoading(true);

      // Fetch X-ray and CT licenses simultaneously
      const [xrayRes, ctRes] = await Promise.allSettled([
        reportsAPI.getLicenseManagement({}, 'xray'),
        ctLicensesAPI.getAll(),
      ]);

      // X-ray results — API already filters by (license_app_scope = 'xray' OR IS NULL)
      // Tag with _fromProduct so the scope dropdown can filter them correctly
      const xrayLicenses = (
        xrayRes.status === 'fulfilled' && xrayRes.value?.status_code === 'dc200'
          ? xrayRes.value.results ?? []
          : []
      ).map(l => ({ ...l, _fromProduct: 'xray' }));

      // CT results — response.results is { licenses: [...], pagination: {...} }
      // license_app_scope field is returned as 'ct' or 'both'
      const ctLicenses = (
        ctRes.status === 'fulfilled' && ctRes.value?.status_code === 'dc200'
          ? ctRes.value.results?.licenses ?? []
          : []
      ).map(l => ({ ...l, _fromProduct: 'ct' }));

      setAllLicenses([...xrayLicenses, ...ctLicenses]);
    } catch (err) {
      console.error('Error fetching licenses for map:', err);
      toast.error('Failed to load license data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLicenses(); }, []);

  // Only licenses with valid coordinates
  const withCoords = useMemo(() =>
    allLicenses.filter(l => {
      const lat = parseFloat(l.latitude);
      const lng = parseFloat(l.longitude);
      return !isNaN(lat) && !isNaN(lng);
    }),
  [allLicenses]);

  // Apply scope dropdown filter
  // For X-ray: _fromProduct === 'xray'  (covers license_app_scope = 'xray' OR IS NULL via OR in API)
  // For CT:    _fromProduct === 'ct' AND license_app_scope === 'ct'
  // For Both:  _fromProduct === 'ct' AND license_app_scope === 'both'
  const scopeFiltered = useMemo(() => {
    if (scopeFilter === 'all')  return withCoords;
    if (scopeFilter === 'xray') return withCoords.filter(l => l._fromProduct === 'xray');
    if (scopeFilter === 'ct')   return withCoords.filter(l => l._fromProduct === 'ct' && l.license_app_scope === 'ct');
    if (scopeFilter === 'both') return withCoords.filter(l => l._fromProduct === 'ct' && l.license_app_scope === 'both');
    return withCoords;
  }, [withCoords, scopeFilter]);

  // Default map center: first scoped license, or India fallback
  const defaultCenter = useMemo(() => {
    const first = scopeFiltered[0];
    if (first) return [parseFloat(first.latitude), parseFloat(first.longitude)];
    return [20.5937, 78.9629]; // India center
  }, [scopeFiltered]);

  // Autocomplete suggestions — search within currently visible (scope-filtered) markers
  useEffect(() => {
    if (!searchInput.trim()) { setSuggestions([]); return; }
    const q = searchInput.trim().toLowerCase();
    setSuggestions(
      scopeFiltered.filter(l => l.license_key?.toLowerCase().includes(q)).slice(0, 6)
    );
  }, [searchInput, scopeFiltered]);

  const handleSelectSuggestion = (license) => {
    setSearchInput(license.license_key);
    setSelectedKey(license.license_key);
    setSuggestions([]);
    setMapCenter([parseFloat(license.latitude), parseFloat(license.longitude)]);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSelectedKey('');
    setSuggestions([]);
    setMapCenter(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const match = scopeFiltered.find(
      l => l.license_key?.toLowerCase() === searchInput.trim().toLowerCase()
    );
    if (match) {
      handleSelectSuggestion(match);
    } else if (searchInput.trim()) {
      toast.error('No mapped license found with that key');
    }
  };

  const getStatusLabel = (l) => {
    const raw = l.license_status || l.status || '';
    return STATUS_LABEL[raw] || raw;
  };

  const getStatusClass = (l) => {
    const raw = l.license_status || l.status || '';
    return STATUS_BADGE[raw] || 'bg-gray-100 text-gray-600';
  };

  const getScopeTag = (l) => {
    if (l._fromProduct === 'xray') return 'xray';
    return l.license_app_scope || 'ct';
  };

  // Counts per scope (from licenses with coords)
  const counts = useMemo(() => ({
    all:  withCoords.length,
    xray: withCoords.filter(l => l._fromProduct === 'xray').length,
    ct:   withCoords.filter(l => l._fromProduct === 'ct' && l.license_app_scope === 'ct').length,
    both: withCoords.filter(l => l._fromProduct === 'ct' && l.license_app_scope === 'both').length,
  }), [withCoords]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">License Location Map</h1>
            <p className="text-sm text-gray-500 mt-0.5">Geographic distribution of all licenses</p>
          </div>
        </div>
        <button
          onClick={fetchLicenses}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{allLicenses.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Licenses</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{counts.xray}</div>
          <div className="text-xs text-gray-500 mt-1">X-ray on Map</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{counts.ct}</div>
          <div className="text-xs text-gray-500 mt-1">CT on Map</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-teal-600">{counts.both}</div>
          <div className="text-xs text-gray-500 mt-1">Both (CT+X-ray)</div>
        </div>
      </div>

      {/* Scope filter + Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Scope dropdown */}
        <select
          value={scopeFilter}
          onChange={e => { setScopeFilter(e.target.value); handleClearSearch(); }}
          className="sm:w-52 px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {SCOPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}{opt.value !== 'all' ? ` (${counts[opt.value] ?? 0})` : ` (${counts.all})`}
            </option>
          ))}
        </select>

        {/* License key search */}
        <div className="relative flex-1" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search license key to locate on map..."
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoComplete="off"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 shrink-0"
            >
              Locate
            </button>
          </form>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-20 mt-1 bg-white rounded-md border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((l) => {
                const scope = getScopeTag(l);
                return (
                  <button
                    key={l.license_key}
                    type="button"
                    onClick={() => handleSelectSuggestion(l)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-900">{l.license_key}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SCOPE_BADGE[scope]}`}>
                        {SCOPE_LABEL[scope]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {l.vendor_name || 'No vendor'} · {parseFloat(l.latitude).toFixed(4)}, {parseFloat(l.longitude).toFixed(4)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <div className="flex items-center justify-center h-[520px] bg-white rounded-lg border border-gray-200 text-gray-400">
          Loading map data...
        </div>
      ) : scopeFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[520px] bg-gray-50 rounded-lg border border-gray-200 text-gray-400">
          <MapPin size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No licenses with coordinates found</p>
          <p className="text-xs mt-1">Add latitude &amp; longitude when creating licenses to see them here</p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height: 520 }}>
          <MapContainer
            center={defaultCenter}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapCenter && <MapController center={mapCenter} />}
            {scopeFiltered.map((license) => {
              const lat  = parseFloat(license.latitude);
              const lng  = parseFloat(license.longitude);
              const isHighlighted = license.license_key === selectedKey;
              const scope = getScopeTag(license);
              return (
                <Marker
                  key={`${license.license_key}-${license._fromProduct}`}
                  position={[lat, lng]}
                  icon={isHighlighted ? highlightedIcon : defaultIcon}
                >
                  <Popup>
                    <div className="text-xs min-w-[190px]">
                      <p className="font-mono font-semibold text-gray-900 mb-1.5">{license.license_key}</p>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SCOPE_BADGE[scope]}`}>
                          {SCOPE_LABEL[scope]}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(license)}`}>
                          {getStatusLabel(license)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-0.5">
                        <span className="font-medium">Vendor:</span> {license.vendor_name || '—'}
                      </p>
                      {license.fullname && (
                        <p className="text-gray-600 mb-0.5">
                          <span className="font-medium">User:</span> {license.fullname}
                        </p>
                      )}
                      <p className="text-gray-400 mt-1.5">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Legend */}
      {!loading && scopeFiltered.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-blue-500" />
            <span>Click any marker for details</span>
          </div>
          {selectedKey && (
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-red-500" />
              <span>Selected: <span className="font-mono font-medium text-gray-700">{selectedKey}</span></span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-3">
            {(['xray', 'ct', 'both']).map(s => (
              <span key={s} className={`px-2 py-0.5 rounded text-xs font-medium ${SCOPE_BADGE[s]}`}>
                {SCOPE_LABEL[s]}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2 text-right">
        Showing {scopeFiltered.length} of {allLicenses.length} licenses
      </p>
    </div>
  );
};

export default LicenseMapReport;
