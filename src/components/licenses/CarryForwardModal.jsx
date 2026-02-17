import React, { useState } from 'react';
import { X, AlertTriangle, Copy } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';
import LicenseStatusBadge from './LicenseStatusBadge';

const CarryForwardModal = ({ isOpen, license, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [newLicense, setNewLicense] = useState(null);
  const [transferUserInfo, setTransferUserInfo] = useState(true);

  const handleCarryForward = async () => {
    if (!license) return;

    setLoading(true);
    try {
      const response = await licensesAPI.carryForward(license.license_id);

      if (response.status_code === 'dc200') {
        setNewLicense(response.results.new_license);
        toast.success('License carried forward successfully');
        onSuccess();
      }
    } catch (error) {
      console.error('Error carrying forward license:', error);
      toast.error(error.response?.data?.message || 'Failed to carry forward license');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleClose = () => {
    setNewLicense(null);
    setTransferUserInfo(true);
    onClose();
  };

  if (!isOpen || !license) return null;

  // Success view after carry forward
  if (newLicense) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Carry Forward Complete</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-3">
                ✓ Credits transferred successfully
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Old License:</span>
                  <span className="font-mono text-gray-900">{license.license_key}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-purple-600 font-medium">Carried Forward</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium mb-3">New License Created</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">License Key:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900">{newLicense.license_key}</span>
                    <button
                      onClick={() => copyToClipboard(newLicense.license_key)}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits:</span>
                  <span className="text-gray-900 font-medium">{license.credit_left}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Carry Forward License</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <p>This will create a new license and mark the current one as "Carried Forward". This action cannot be undone.</p>
            </div>
          </div>

          {/* Source License Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Source License</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">License Key:</span>
                <span className="text-sm font-mono text-gray-900">{license.license_key}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Status:</span>
                <LicenseStatusBadge status={license.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plan:</span>
                <span className="text-sm text-gray-900">{license.plan_name || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credits Remaining:</span>
                <span className="text-sm font-bold text-green-600">{license.credit_left} credits</span>
              </div>
              {license.username && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Username:</span>
                  <span className="text-sm text-gray-900">{license.username}</span>
                </div>
              )}
              {license.mobile && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mobile:</span>
                  <span className="text-sm text-gray-900">{license.mobile}</span>
                </div>
              )}
            </div>
          </div>

          {/* Transfer Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Transfer Details</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{license.credit_left} credits</strong> will be transferred to the new license
              </p>
            </div>
          </div>

          {/* User Info Transfer Option */}
          {(license.username || license.mobile || license.vendor_name || license.geo_location) && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transferUserInfo}
                  onChange={(e) => setTransferUserInfo(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  Transfer user information (username, mobile, vendor, location)
                </span>
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleCarryForward}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Carry Forward License'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarryForwardModal;
