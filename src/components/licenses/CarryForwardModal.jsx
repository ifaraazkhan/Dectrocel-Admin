import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';
import LicenseStatusBadge from './LicenseStatusBadge';

const CarryForwardModal = ({ isOpen, license, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState('');
  const [validityDays, setValidityDays] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && license) {
      setCredits(String(license.credit_left ?? ''));
      // Prefill validity with days remaining on source license (if end_date is in the future)
      let defaultValidity = '';
      if (license.end_date) {
        const end = new Date(license.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        if (Number.isFinite(diff) && diff > 0) defaultValidity = String(diff);
      }
      setValidityDays(defaultValidity);
      setError('');
    }
  }, [isOpen, license]);

  // Compute expiry date preview from entered validity days
  const computedExpiry = (() => {
    const v = Number(validityDays);
    if (!Number.isFinite(v) || !Number.isInteger(v) || v <= 0) return '';
    const d = new Date();
    d.setDate(d.getDate() + v);
    return d.toISOString().split('T')[0];
  })();

  const validate = () => {
    const c = Number(credits);
    const v = Number(validityDays);
    if (!Number.isFinite(c) || !Number.isInteger(c) || c <= 0) {
      return 'Credits must be a positive whole number.';
    }
    if (!Number.isFinite(v) || !Number.isInteger(v) || v <= 0) {
      return 'Validity (days) must be a positive whole number.';
    }
    return '';
  };

  const handleConfirm = async () => {
    const msg = validate();
    if (msg) { setError(msg); return; }
    setError('');
    setLoading(true);
    try {
      const response = await licensesAPI.carryForwardNew(license.license_id, {
        credits: Number(credits),
        validity_days: Number(validityDays),
      });
      if (response.status_code === 'dc200') {
        toast.success(response.message);
        // Pass result up so parent can show success modal, then close this modal
        onSuccess({
          ...response.results,
          source_license_key: response.results?.source_license_key || license.license_key,
        });
        onClose();
      } else {
        toast.error(response.message || 'Failed to carry forward');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to carry forward license');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCredits('');
    setValidityDays('');
    setError('');
    onClose();
  };

  if (!isOpen || !license) return null;

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
              A <strong>new license</strong> will be generated under the same plan with the credits and validity you specify.
              The source license will be marked as <strong>Carried Forward</strong> and cannot be used again.
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
                <span className="text-gray-500">Available credits:</span>
                <span className="font-bold text-blue-700">{license.credit_left} credits</span>
              </div>
            </div>
          </div>

          {/* Credits input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credits for new license <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={credits}
              onChange={(e) => { setCredits(e.target.value); setError(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter credits"
            />
          </div>

          {/* Validity input */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Validity (days) <span className="text-red-500">*</span>
              </label>
              {computedExpiry && (
                <span className="text-xs text-gray-500">
                  Expires on <span className="font-medium text-gray-700">{computedExpiry}</span>
                </span>
              )}
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={validityDays}
              onChange={(e) => { setValidityDays(e.target.value); setError(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 365"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleClose} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={loading || !credits || !validityDays}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : 'Generate New License'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarryForwardModal;
