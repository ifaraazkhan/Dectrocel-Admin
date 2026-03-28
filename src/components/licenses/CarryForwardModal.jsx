import React, { useState } from 'react';
import { X, AlertTriangle, Search } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';
import LicenseStatusBadge from './LicenseStatusBadge';

const CarryForwardModal = ({ isOpen, license, onClose, onSuccess }) => {
  const [loading,       setLoading]       = useState(false);
  const [searchInput,   setSearchInput]   = useState('');
  const [searching,     setSearching]     = useState(false);
  const [targetLicense, setTargetLicense] = useState(null);
  const [searchError,   setSearchError]   = useState('');
  const [done,          setDone]          = useState(null); // result after success

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchError('');
    setTargetLicense(null);
    setSearching(true);
    try {
      // Search by license key or ID
      const resp = await licensesAPI.getAll({ search: searchInput.trim(), limit: 5 });
      if (resp.status_code === 'dc200' && resp.results.licenses.length > 0) {
        // Pick the best match — exact key first
        const exact = resp.results.licenses.find(
          l => l.license_key === searchInput.trim().toUpperCase()
        );
        const found = exact || resp.results.licenses[0];

        if (
          String(found.license_id) === String(license.license_id) ||
          found.license_key === license.license_key
        ) {
          setSearchError('Cannot carry forward to the same license.');
        } else if (!['A', 'U'].includes(found.status)) {
          setSearchError(`Target license is "${found.status}" — it must be Active (A) or In Use (U).`);
        } else {
          setTargetLicense(found);
        }
      } else {
        setSearchError('No license found with that key.');
      }
    } catch {
      setSearchError('Search failed. Try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = async () => {
    if (!license || !targetLicense) return;
    setLoading(true);
    try {
      const response = await licensesAPI.carryForward(license.license_id, targetLicense.license_id);
      if (response.status_code === 'dc200') {
        setDone(response.results);
        toast.success(response.message);
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to carry forward');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to carry forward license');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchInput('');
    setTargetLicense(null);
    setSearchError('');
    setDone(null);
    onClose();
  };

  if (!isOpen || !license) return null;

  // ── Success view ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Carry Forward Complete</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm space-y-2">
              <p className="text-green-800 font-medium">✓ {done.credits_moved} credits transferred successfully</p>
              <div className="flex justify-between text-gray-600">
                <span>Source license:</span>
                <span className="font-mono text-gray-900">{license.license_key}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Target license:</span>
                <span className="font-mono text-gray-900">{done.target_license_key}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Target new balance:</span>
                <span className="font-bold text-green-700">{done.target_new_credit_left} credits</span>
              </div>
            </div>
            <button onClick={handleClose}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Carry Forward License</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-yellow-800">
              Remaining credits from the source license will be <strong>added to</strong> the target license.
              The source will be marked as <strong>Carried Forward</strong> and cannot be used again.
            </p>
          </div>

          {/* Source license */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Source License</h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Key:</span>
                <span className="font-mono text-gray-900">{license.license_key}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status:</span>
                <LicenseStatusBadge status={license.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Credits to transfer:</span>
                <span className="font-bold text-blue-700">{license.credit_left} credits</span>
              </div>
            </div>
          </div>

          {/* Target license search */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Target License <span className="text-red-500">*</span>
            </h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => { setSearchInput(e.target.value); setSearchError(''); setTargetLicense(null); }}
                placeholder="Enter license key to search"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" disabled={searching || !searchInput.trim()}
                className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1">
                <Search size={15} />
                {searching ? '...' : 'Find'}
              </button>
            </form>

            {searchError && (
              <p className="text-xs text-red-600 mt-1">{searchError}</p>
            )}

            {targetLicense && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm space-y-1.5">
                <p className="text-blue-800 font-medium text-xs uppercase tracking-wide mb-1">Target Found</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Key:</span>
                  <span className="font-mono text-gray-900">{targetLicense.license_key}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status:</span>
                  <LicenseStatusBadge status={targetLicense.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current credits:</span>
                  <span className="text-gray-900">{targetLicense.credit_left ?? 0}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1.5 mt-1.5">
                  <span className="text-gray-600 font-medium">After transfer:</span>
                  <span className="font-bold text-green-700">
                    {(parseInt(targetLicense.credit_left) || 0) + (parseInt(license.credit_left) || 0)} credits
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleClose} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={loading || !targetLicense}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : 'Confirm Transfer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarryForwardModal;
