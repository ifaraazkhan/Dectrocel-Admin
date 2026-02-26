import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ctLicensesAPI } from '../../api/ctAdmin';
import toast from 'react-hot-toast';

const CTCreateLicenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ct_credits:        '',
    end_date:          '',
    license_app_scope: 'ct',
    fullname:          '',
    username:          '',
    mobile:            '',
    vendor_name:       '',
    geo_location:      '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.ct_credits || parseInt(formData.ct_credits) < 1) {
      toast.error('Please enter a valid number of CT credits (minimum 1)');
      return;
    }
    if (!formData.end_date) {
      toast.error('Please select an expiry date');
      return;
    }

    setLoading(true);
    try {
      const response = await ctLicensesAPI.create({
        ct_credits:        parseInt(formData.ct_credits),
        end_date:          formData.end_date,
        license_app_scope: formData.license_app_scope,
        fullname:          formData.fullname      || undefined,
        username:          formData.username      || undefined,
        mobile:            formData.mobile        || undefined,
        vendor_name:       formData.vendor_name   || undefined,
        geo_location:      formData.geo_location  || undefined,
      });

      if (response.status_code === 'dc200') {
        const newLicense = response.results;
        toast.success(`CT License created: ${newLicense.license_key}`);
        navigator.clipboard.writeText(newLicense.license_key).catch(() => {});
        toast.success('License key copied to clipboard');
        onSuccess(newLicense);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating CT license:', error);
      toast.error(error.response?.data?.message || 'Failed to create CT license');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      ct_credits: '', end_date: '', license_app_scope: 'ct',
      fullname: '', username: '', mobile: '', vendor_name: '', geo_location: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create CT License</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* CT Credits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CT Credits <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.ct_credits}
              onChange={(e) => setFormData({ ...formData, ct_credits: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 100"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Number of CT scans allowed</p>
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
          </div>

          {/* License Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Scope <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.license_app_scope}
              onChange={(e) => setFormData({ ...formData, license_app_scope: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ct">CT Only</option>
              <option value="both">CT + X-ray</option>
            </select>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Optional)</label>
            <input
              type="text"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Hospital / Doctor name"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username (Optional)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile (Optional)</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
            />
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name (Optional)</label>
            <input
              type="text"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Distributor / vendor name"
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
              placeholder="City / State / Country"
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
              {loading ? 'Creating...' : 'Generate CT License'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CTCreateLicenseModal;
