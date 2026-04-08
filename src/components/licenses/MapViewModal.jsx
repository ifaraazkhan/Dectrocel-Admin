import React, { useState } from 'react';
import { X, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import LicenseStatusBadge from './LicenseStatusBadge';

const MapViewModal = ({ isOpen, onClose, license }) => {
  const [fullscreen, setFullscreen] = useState(false);

  if (!isOpen || !license) return null;

  const lat = parseFloat(license.latitude);
  const lng = parseFloat(license.longitude);
  const hasCoords = !isNaN(lat) && !isNaN(lng);

  const mapSrc = hasCoords
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : null;

  const mapHeight = fullscreen ? 'calc(100vh - 190px)' : 320;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70]">
      <div className={`bg-white rounded-lg shadow-xl mx-4 transition-all duration-200 ${fullscreen ? 'w-full max-w-5xl' : 'w-full max-w-xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary-600" />
            <h2 className="text-base font-semibold text-gray-900">License Location</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullscreen(f => !f)}
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* License Info Card */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3 text-sm flex-wrap">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">License Number</p>
              <p className="font-mono font-semibold text-gray-900">{license.license_key || '—'}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Vendor</p>
              <p className="font-medium text-gray-900">{license.vendor_name || '—'}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <LicenseStatusBadge status={license.status} />
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="px-4 pb-4">
          {hasCoords ? (
            <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: mapHeight }}>
              <iframe
                title="License Location"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200 text-gray-400">
              <MapPin size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No coordinates available for this license</p>
            </div>
          )}
          {hasCoords && (
            <p className="text-xs text-gray-400 mt-1.5 text-center">{lat}, {lng}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapViewModal;
