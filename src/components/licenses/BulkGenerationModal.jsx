import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';

const BulkGenerationModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedLicenses, setGeneratedLicenses] = useState(null);
  const [formData, setFormData] = useState({
    num_licenses: '',
    credit_left:  '',
    end_date:     '',
    vendor_name:  '',
    geo_location: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numLicenses = parseInt(formData.num_licenses);
    if (!numLicenses || numLicenses < 1) {
      toast.error('Please enter a valid number of licenses (minimum 1)');
      return;
    }
    if (numLicenses > 1000) {
      toast.error('Maximum 1000 licenses per batch');
      return;
    }
    if (!formData.credit_left || parseInt(formData.credit_left) < 1) {
      toast.error('Please enter a valid number of credits per license');
      return;
    }
    if (!formData.end_date) {
      toast.error('Please select an expiry date');
      return;
    }

    // Confirm large batches
    if (numLicenses > 100 && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setLoading(true);
    try {
      const response = await licensesAPI.bulkCreate({
        num_licenses: numLicenses,
        credit_left:  parseInt(formData.credit_left),
        end_date:     formData.end_date,
        vendor_name:  formData.vendor_name  || undefined,
        geo_location: formData.geo_location || undefined,
      });

      if (response.status_code === 'dc200') {
        setGeneratedLicenses(response.results);
        toast.success(`${numLicenses} licenses generated successfully`);
        onSuccess();
      }
    } catch (error) {
      console.error('Error generating licenses:', error);
      toast.error(error.response?.data?.message || 'Failed to generate licenses');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const downloadCSV = () => {
    if (!generatedLicenses || generatedLicenses.length === 0) return;

    const headers = ['License Key', 'Credits', 'Status', 'Created Date'];
    const rows = generatedLicenses.map((license) => [
      license.license_key,
      license.credit_left || 0,
      license.status,
      new Date().toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xray_licenses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('CSV downloaded successfully');
  };

  const handleClose = () => {
    setFormData({ num_licenses: '', credit_left: '', end_date: '', vendor_name: '', geo_location: '' });
    setGeneratedLicenses(null);
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  // Success view
  if (generatedLicenses) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Licenses Generated</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-medium">
                ✓ {generatedLicenses.length} licenses generated successfully
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={downloadCSV}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                <Download size={18} /> Download CSV
              </button>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              License keys are ready for distribution
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation view for large batches
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Confirm Large Batch</h2>
            <button onClick={() => setShowConfirmation(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                You're about to generate <strong>{formData.num_licenses}</strong> licenses
                with <strong>{formData.credit_left}</strong> credits each.
                This may take a moment.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Bulk X-ray License Generation</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Number of Licenses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Licenses <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.num_licenses}
              onChange={(e) => setFormData({ ...formData, num_licenses: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter quantity"
              min="1"
              max="1000"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 1000 per batch</p>
          </div>

          {/* Credits per License */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credits per License <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.credit_left}
              onChange={(e) => setFormData({ ...formData, credit_left: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 500"
              min="1"
              required
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Applied to all generated licenses</p>
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name (Optional)</label>
            <input
              type="text"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Applied to all licenses"
            />
          </div>

          {/* Geo Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geo Location (Optional)</label>
            <input
              type="text"
              value={formData.geo_location}
              onChange={(e) => setFormData({ ...formData, geo_location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Applied to all licenses"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Licenses'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkGenerationModal;
