import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { ctLicensesAPI } from '../../api/ctAdmin';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';
import LicenseStatusBadge from './LicenseStatusBadge';

const CTLicenseDetailModal = ({ isOpen, licenseId, onClose, onBlock, onUnblock }) => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (isOpen && licenseId) {
      fetchDetails();
    }
  }, [isOpen, licenseId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await ctLicensesAPI.getById(licenseId);
      if (response.status_code === 'dc200') {
        setLicense(response.results);
      }
    } catch (error) {
      console.error('Error fetching CT license details:', error);
      toast.error('Failed to load CT license details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleBlock = async () => {
    if (!license) return;
    setBlocking(true);
    try {
      await ctLicensesAPI.update(licenseId, { status: 'R' });
      toast.success('CT license blocked');
      onBlock && onBlock(license);
      onClose();
    } catch (e) {
      toast.error('Failed to block CT license');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async () => {
    if (!license) return;
    setBlocking(true);
    try {
      await ctLicensesAPI.update(licenseId, { status: 'A' });
      toast.success('CT license unblocked');
      onUnblock && onUnblock(license);
      onClose();
    } catch (e) {
      toast.error('Failed to unblock CT license');
    } finally {
      setBlocking(false);
    }
  };

  const daysRemaining = (endDate) => {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-8 text-center text-gray-500">
          Loading CT license details...
        </div>
      </div>
    );
  }

  if (!license) return null;

  const days = daysRemaining(license.end_date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">CT License Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

          {/* License Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">License Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">License Key</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900">{license.license_key}</span>
                  <button onClick={() => copyToClipboard(license.license_key)} className="p-1 text-gray-400 hover:text-gray-700">
                    <Copy size={15} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <LicenseStatusBadge status={license.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scope</span>
                <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {license.license_app_scope === 'both' ? 'CT + X-ray' : 'CT Only'}
                </span>
              </div>
            </div>
          </div>

          {/* CT Credits */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">CT Credits</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Credits Remaining</span>
                <span className="text-lg font-bold text-gray-900">{license.ct_credits ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total CT Scans</span>
                <span className="text-sm text-gray-900">{license.total_scans ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Scans</span>
                <span className="text-sm text-green-700 font-medium">{license.completed_scans ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Assignment</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {[
                ['Full Name', license.fullname],
                ['Username', license.username],
                ['Mobile', license.mobile],
                ['Vendor', license.vendor_name],
                ['Location', license.geo_location],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm text-gray-900">{val || '-'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expiry & Sync */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Validity & Sync</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expiry Date</span>
                <span className="text-sm text-gray-900">
                  {license.end_date ? new Date(license.end_date).toLocaleDateString() : '-'}
                </span>
              </div>
              {days !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days Remaining</span>
                  <span className={`text-sm font-bold ${days < 0 ? 'text-red-600' : days < 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {days < 0 ? 'Expired' : `${days} days`}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-sm text-gray-900">
                  {license.last_sync ? new Date(license.last_sync).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Hash</span>
                <span className="text-sm text-gray-900 truncate max-w-xs">{license.system_hash || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Activation Count</span>
                <span className="text-sm text-gray-900">{license.activation_count ?? 0}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50">
          {/* Refund estimate — only shown when not already revoked */}
          {license.status !== 'R' && (() => {
            const planCost   = license.plan_cost   ?? 0;
            const planCreds  = license.plan_credits ?? 0;
            const remaining  = license.ct_credits   ?? 0;
            const refund = (planCost > 0 && planCreds > 0)
              ? Math.max(0, Math.round((remaining / planCreds) * planCost))
              : 0;
            return (
              <div className={`mb-4 rounded-lg p-3 border flex justify-between items-center ${refund > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-100 border-gray-200'}`}>
                <div>
                  <p className="text-sm font-medium text-gray-700">Estimated Refund if Blocked</p>
                  {planCost > 0 && planCreds > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{remaining} / {planCreds} CT credits remaining · Plan cost ₹{planCost.toLocaleString()}</p>
                  )}
                  {(!planCost || planCost <= 0) && (
                    <p className="text-xs text-gray-400 mt-0.5">No plan cost set — refund not applicable</p>
                  )}
                </div>
                <span className={`text-lg font-bold ${refund > 0 ? 'text-amber-700' : 'text-gray-400'}`}>₹{refund.toLocaleString()}</span>
              </div>
            );
          })()}
          <div className="flex justify-end gap-3">
          {license.status !== 'R' ? (
            <button
              onClick={handleBlock}
              disabled={blocking}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {blocking ? 'Blocking...' : 'Block License'}
            </button>
          ) : (
            <button
              onClick={handleUnblock}
              disabled={blocking}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {blocking ? 'Unblocking...' : 'Unblock License'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTLicenseDetailModal;
