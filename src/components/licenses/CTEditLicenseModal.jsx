import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ctLicensesAPI } from '../../api/ctAdmin';
import toast from 'react-hot-toast';

const CTEditLicenseModal = ({ isOpen, licenseId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    fullname:    '',
    username:    '',
    mobile:      '',
    vendor_name: '',
    latitude:    '',
    longitude:   '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (isOpen && licenseId) fetchLicense();
  }, [isOpen, licenseId]);

  const fetchLicense = async () => {
    try {
      setLoading(true);
      const response = await ctLicensesAPI.getById(licenseId);
      if (response.status_code === 'dc200') {
        const l = response.results;
        setForm({
          fullname:    l.fullname    || '',
          username:    l.username    || '',
          mobile:      l.mobile      || '',
          vendor_name: l.vendor_name || '',
          latitude:    l.latitude  != null ? String(l.latitude)  : '',
          longitude:   l.longitude != null ? String(l.longitude) : '',
        });
      }
    } catch {
      toast.error('Failed to load CT license');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ctLicensesAPI.update(licenseId, {
        fullname:    form.fullname    || null,
        username:    form.username    || null,
        mobile:      form.mobile      || null,
        vendor_name: form.vendor_name || null,
        latitude:    form.latitude  ? parseFloat(form.latitude)  : null,
        longitude:   form.longitude ? parseFloat(form.longitude) : null,
      });
      toast.success('CT license updated');
      onSuccess && onSuccess();
      onClose();
    } catch {
      toast.error('Failed to update CT license');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8 text-center text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit CT License</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {[
              { label: 'Full Name',    name: 'fullname',    placeholder: 'Enter full name' },
              { label: 'Username',     name: 'username',    placeholder: 'Enter username' },
              { label: 'Mobile',       name: 'mobile',      placeholder: 'Enter mobile number' },
              { label: 'Vendor Name',  name: 'vendor_name', placeholder: 'Enter vendor name' },
            ].map(({ label, name, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number" step="any" name="latitude"
                  value={form.latitude} onChange={handleChange}
                  placeholder="e.g. 28.6139"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number" step="any" name="longitude"
                  value={form.longitude} onChange={handleChange}
                  placeholder="e.g. 77.2090"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CTEditLicenseModal;
