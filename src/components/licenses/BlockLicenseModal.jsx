import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';
import LicenseStatusBadge from './LicenseStatusBadge';

const BlockLicenseModal = ({ isOpen, license, onClose, onSuccess, isUnblock = false }) => {
  const [loading, setLoading] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const blockReasons = [
    'Fraud Detected',
    'Payment Dispute',
    'Policy Violation',
    'User Request',
    'Duplicate License',
    'Testing/Demo License',
    'Other'
  ];

  const handleBlock = async () => {
    if (!license) return;

    if (!isUnblock && !blockReason) {
      toast.error('Please select a reason for blocking');
      return;
    }

    setLoading(true);
    try {
      const response = await licensesAPI.update(license.license_id, {
        status: isUnblock ? 'A' : 'R',
        // Store block reason in error_logs field for now
        error_logs: isUnblock ? null : `${blockReason}${additionalDetails ? `: ${additionalDetails}` : ''}`
      });

      if (response.status_code === 'dc200') {
        toast.success(isUnblock ? 'License unblocked successfully' : 'License blocked successfully');
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error('Error updating license:', error);
      toast.error(error.response?.data?.message || `Failed to ${isUnblock ? 'unblock' : 'block'} license`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBlockReason('');
    setAdditionalDetails('');
    onClose();
  };

  if (!isOpen || !license) return null;

  // Unblock confirmation
  if (isUnblock) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Unblock License</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* License Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">License Key:</span>
                <span className="text-sm font-mono text-gray-900">{license.license_key}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Status:</span>
                <LicenseStatusBadge status={license.status} />
              </div>
              {license.username && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Username:</span>
                  <span className="text-sm text-gray-900">{license.username}</span>
                </div>
              )}
            </div>

            {/* Confirmation Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                This license will be restored to <strong>Available</strong> status and can be used again.
              </p>
            </div>

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
                onClick={handleBlock}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Unblocking...' : 'Unblock License'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Block confirmation with reason
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Block License</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* License Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">License to Block</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">License Key:</span>
                <span className="text-sm font-mono text-gray-900">{license.license_key}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Status:</span>
                <LicenseStatusBadge status={license.status} />
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credits Remaining:</span>
                <span className="text-sm font-bold text-red-600">{license.credit_left || 0} (will be lost)</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">⚠️ Blocking this license will:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Prevent any further usage</li>
                <li>Make remaining credits unavailable</li>
                <li>Stop all sync operations</li>
              </ul>
              <p className="mt-2 text-xs">This action can be reversed by unblocking.</p>
            </div>
          </div>

          {/* Block Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Blocking <span className="text-red-500">*</span>
            </label>
            <select
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Select a reason</option>
              {blockReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="3"
              placeholder="Enter any additional information about why this license is being blocked..."
            />
          </div>

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
              onClick={handleBlock}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Blocking...' : 'Block License'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockLicenseModal;
