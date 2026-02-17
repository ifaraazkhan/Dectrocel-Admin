import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';

const BulkGenerationModal = ({ isOpen, onClose, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedLicenses, setGeneratedLicenses] = useState(null);
  const [formData, setFormData] = useState({
    plan_id: '',
    num_licenses: '',
    vendor_name: '',
    geo_location: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      setGeneratedLicenses(null);
      setShowConfirmation(false);
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await licensesAPI.getPlans();
      if (response.status_code === 'dc200') {
        setPlans(response.results);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.plan_id) {
      toast.error('Please select a plan');
      return;
    }

    const numLicenses = parseInt(formData.num_licenses);
    if (!numLicenses || numLicenses < 1) {
      toast.error('Please enter a valid number of licenses (minimum 1)');
      return;
    }

    if (numLicenses > 1000) {
      toast.error('Maximum 1000 licenses per batch');
      return;
    }

    // Show confirmation for large batches
    if (numLicenses > 100 && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setLoading(true);
    try {
      const response = await licensesAPI.bulkGenerate({
        plan_id: parseInt(formData.plan_id),
        num_licenses: numLicenses
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

    const selectedPlan = plans.find(p => p.plan_id === parseInt(formData.plan_id));
    const planName = selectedPlan?.plan_name || 'Unknown Plan';

    // Create CSV content
    const headers = ['License Key', 'Plan Name', 'Credits', 'Status', 'Created Date'];
    const rows = generatedLicenses.map(license => [
      license.license_key,
      planName,
      license.credit_left || 0,
      license.status,
      new Date().toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `licenses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('CSV downloaded successfully');
  };

  const handleClose = () => {
    setFormData({
      plan_id: '',
      num_licenses: '',
      vendor_name: '',
      geo_location: ''
    });
    setGeneratedLicenses(null);
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  // Success view after generation
  if (generatedLicenses) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Licenses Generated</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                <Download size={18} />
                Download CSV
              </button>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              License keys have been generated and are ready for download
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
            <button
              onClick={() => setShowConfirmation(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                You're about to generate <strong>{formData.num_licenses}</strong> licenses. This operation may take a moment to complete.
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
          <h2 className="text-xl font-semibold text-gray-900">Bulk License Generation</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.plan_id}
              onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.plan_name} ({plan.credits} credits, {plan.validity_days} days)
                </option>
              ))}
            </select>
          </div>

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

          {/* Vendor Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name (Optional)
            </label>
            <input
              type="text"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Applied to all licenses"
            />
          </div>

          {/* Geo Location (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geo Location (Optional)
            </label>
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
