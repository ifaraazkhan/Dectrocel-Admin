import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';

const CreateLicenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plan_id: '',
    username: '',
    mobile: '',
    vendor_name: '',
    geo_location: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
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

    setLoading(true);
    try {
      // Use bulk generate with count=1 for single license creation
      const response = await licensesAPI.bulkGenerate({
        plan_id: parseInt(formData.plan_id),
        num_licenses: 1
      });

      if (response.status_code === 'dc200') {
        const newLicense = response.results[0];
        toast.success(`License created: ${newLicense.license_key}`);

        // Copy to clipboard
        navigator.clipboard.writeText(newLicense.license_key);
        toast.success('License key copied to clipboard');

        onSuccess(newLicense);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating license:', error);
      toast.error(error.response?.data?.message || 'Failed to create license');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      plan_id: '',
      username: '',
      mobile: '',
      vendor_name: '',
      geo_location: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New License</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
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

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username (Optional)
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter username"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile (Optional)
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
            />
            <p className="text-xs text-gray-500 mt-1">10 digits</p>
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name (Optional)
            </label>
            <input
              type="text"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter vendor name"
            />
          </div>

          {/* Geo Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geo Location (Optional)
            </label>
            <input
              type="text"
              value={formData.geo_location}
              onChange={(e) => setFormData({ ...formData, geo_location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter location"
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
              {loading ? 'Creating...' : 'Generate License'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLicenseModal;
