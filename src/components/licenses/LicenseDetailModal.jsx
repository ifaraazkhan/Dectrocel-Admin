import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';
import LicenseStatusBadge from './LicenseStatusBadge';

const LicenseDetailModal = ({ isOpen, licenseId, onClose, onCarryForward, onBlock, onUnblock }) => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && licenseId) {
      fetchLicenseDetails();
    }
  }, [isOpen, licenseId]);

  const fetchLicenseDetails = async () => {
    try {
      setLoading(true);
      const response = await licensesAPI.getById(licenseId);
      if (response.status_code === 'dc200') {
        setLicense(response.results);
      }
    } catch (error) {
      console.error('Error fetching license details:', error);
      toast.error('Failed to load license details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateUsagePercentage = (total, left) => {
    if (!total || total === 0) return 0;
    const used = total - (left || 0);
    return Math.round((used / total) * 100);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-8">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading license details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!license) return null;

  const totalCredits = license.credits || 0;
  const creditsLeft = license.credit_left || 0;
  const creditsUsed = totalCredits - creditsLeft;
  const usagePercentage = calculateUsagePercentage(totalCredits, creditsLeft);
  const daysRemaining = calculateDaysRemaining(license.end_date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">License Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Section 1: License Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">License Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">License Key:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900">{license.license_key}</span>
                  <button
                    onClick={() => copyToClipboard(license.license_key)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">License ID:</span>
                <span className="text-sm text-gray-900">{license.license_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <LicenseStatusBadge status={license.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Plan:</span>
                <span className="text-sm text-gray-900">{license.plan_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Usage Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Usage Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Credits:</span>
                <span className="text-sm text-gray-900">{totalCredits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Credits Used:</span>
                <span className="text-sm text-gray-900">{creditsUsed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Credits Remaining:</span>
                <span className="text-sm font-bold text-gray-900">{creditsLeft}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Usage:</span>
                  <span className="text-sm text-gray-900">{usagePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usagePercentage > 80 ? 'bg-red-500' :
                      usagePercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Assignment Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Assignment Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Username:</span>
                <span className="text-sm text-gray-900">{license.username || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Mobile:</span>
                <span className="text-sm text-gray-900">{license.mobile || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Vendor Name:</span>
                <span className="text-sm text-gray-900">{license.vendor_name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Geo Location:</span>
                <span className="text-sm text-gray-900">{license.geo_location || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Activation Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Activation Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Activation Date:</span>
                <span className="text-sm text-gray-900">
                  {license.start_date ? new Date(license.start_date).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Expiry Date:</span>
                <span className="text-sm text-gray-900">
                  {license.end_date ? new Date(license.end_date).toLocaleDateString() : '-'}
                </span>
              </div>
              {daysRemaining !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Days Remaining:</span>
                  <span className={`text-sm font-bold ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Platform:</span>
                <span className="text-sm text-gray-900">{license.app_version_type || 'both'}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Sync & Device Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sync & Device Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Last Sync:</span>
                <span className="text-sm text-gray-900">
                  {license.last_sync ? new Date(license.last_sync).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">System Hash:</span>
                <span className="text-sm text-gray-900 truncate max-w-xs">{license.system_hash || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">MAC Address:</span>
                <span className="text-sm text-gray-900">{license.mac_address || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Activation Count:</span>
                <span className="text-sm text-gray-900">{license.activation_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Activation Attempts:</span>
                <span className="text-sm text-gray-900">{license.activation_attempt_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Section 6: Fraud Detection */}
          {(license.fraud_detected || license.fraud_attempt_count > 0) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Fraud Detection</h3>
              <div className="bg-red-50 rounded-lg p-4 space-y-3 border border-red-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Fraud Detected:</span>
                  <span className={`text-sm font-bold ${license.fraud_detected ? 'text-red-600' : 'text-green-600'}`}>
                    {license.fraud_detected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Fraud Attempts:</span>
                  <span className="text-sm text-gray-900">{license.fraud_attempt_count || 0}</span>
                </div>
                {license.last_fraud_attempt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Last Attempt:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(license.last_fraud_attempt).toLocaleString()}
                    </span>
                  </div>
                )}
                {license.last_fraud_reason && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">Reason:</span>
                    <span className="text-sm text-gray-900">{license.last_fraud_reason}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 7: Carry Forward History */}
          {(license.carried_forward_from || license.carried_forward_to) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Carry Forward History</h3>
              <div className="bg-purple-50 rounded-lg p-4 space-y-3 border border-purple-200">
                {license.carried_forward_from && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Carried forward from:</span>
                    <span className="text-sm text-purple-700 font-medium">
                      License #{license.carried_forward_from}
                    </span>
                  </div>
                )}
                {license.carried_forward_to && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Carried forward to:</span>
                    <span className="text-sm text-purple-700 font-medium font-mono">
                      {license.carried_forward_to_key || `#${license.carried_forward_to}`}
                    </span>
                  </div>
                )}
                {license.carry_forward_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Transfer Date:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(license.carry_forward_date).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          {license.credit_left > 0 && license.status !== 'CF' && license.status !== 'R' && (
            <button
              onClick={() => {
                onCarryForward(license);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
            >
              Carry Forward
            </button>
          )}

          {license.status !== 'R' ? (
            <button
              onClick={() => {
                onBlock(license);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Block License
            </button>
          ) : (
            <button
              onClick={() => {
                onUnblock(license);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Unblock License
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
  );
};

export default LicenseDetailModal;
