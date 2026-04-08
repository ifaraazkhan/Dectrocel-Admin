import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ctLicensesAPI } from '../../api/ctAdmin';
import plansAPI from '../../api/plans';
import toast from 'react-hot-toast';

const CTCreateLicenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [form, setForm] = useState({
    license_app_scope: 'ct',
    fullname:          '',
    username:          '',
    mobile:            '',
    vendor_name:       '',
    latitude:          '',
    longitude:         '',
  });

  // Load CT license plans
  useEffect(() => {
    if (!isOpen) return;
    setPlansLoading(true);
    plansAPI.getByType('ct_license')
      .then(resp => {
        if (resp.status_code === 'dc200') setPlans(resp.results || []);
      })
      .catch(() => toast.error('Could not load CT plans'))
      .finally(() => setPlansLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (selectedPlanId) {
      const plan = plans.find(p => String(p.plan_id) === String(selectedPlanId));
      setSelectedPlan(plan || null);
    } else {
      setSelectedPlan(null);
    }
  }, [selectedPlanId, plans]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlan) {
      toast.error('Please select a plan'); return;
    }
    if (!selectedPlan.credits || selectedPlan.credits < 1) {
      toast.error('Selected plan has invalid credits'); return;
    }
    if (!selectedPlan.validity_days || parseInt(selectedPlan.validity_days) < 1) {
      toast.error('Selected plan has invalid validity'); return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(selectedPlan.validity_days));
    const end_date = endDate.toISOString().split('T')[0];

    setLoading(true);
    try {
      const response = await ctLicensesAPI.create({
        ct_credits:        selectedPlan.credits,
        end_date,
        plan_id:           parseInt(selectedPlanId),
        license_app_scope: form.license_app_scope,
        fullname:          form.fullname     || undefined,
        username:          form.username     || undefined,
        mobile:            form.mobile       || undefined,
        vendor_name:       form.vendor_name  || undefined,
        latitude:          form.latitude  ? parseFloat(form.latitude)  : undefined,
        longitude:         form.longitude ? parseFloat(form.longitude) : undefined,
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
      toast.error(error.response?.data?.message || 'Failed to create CT license');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPlanId('');
    setSelectedPlan(null);
    setForm({ license_app_scope: 'ct', fullname: '', username: '', mobile: '', vendor_name: '', latitude: '', longitude: '' });
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Plan Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select CT Plan <span className="text-red-500">*</span>
            </label>
            {plansLoading ? (
              <p className="text-sm text-gray-400">Loading plans...</p>
            ) : plans.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                No CT license plans found.{' '}
                <a href="/plans" className="underline font-medium">Create a CT plan first</a>.
              </div>
            ) : (
              <>
                <select
                  value={selectedPlanId}
                  onChange={e => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  required
                >
                  <option value="">— Choose a plan —</option>
                  {plans.map(p => (
                    <option key={p.plan_id} value={p.plan_id}>
                      {p.plan_name} · {p.credits} credits · {p.validity_days} days
                      {p.plan_cost > 0 ? ` · ₹${p.plan_cost}` : ''}
                    </option>
                  ))}
                </select>

                {selectedPlan && (
                  <div className="mt-2 bg-primary-50 border border-primary-100 rounded-md p-3 text-xs text-primary-800 space-y-1">
                    <div className="flex justify-between">
                      <span>CT Credits</span>
                      <strong>{selectedPlan.credits?.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Validity</span>
                      <strong>{selectedPlan.validity_days} days</strong>
                    </div>
                    {selectedPlan.plan_cost > 0 && (
                      <div className="flex justify-between">
                        <span>Cost</span>
                        <strong>₹{selectedPlan.plan_cost.toLocaleString()}</strong>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* License Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Scope</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {[
                { value: 'ct', label: 'CT Only' },
                { value: 'both', label: 'CT + X-ray' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm(f => ({ ...f, license_app_scope: opt.value }))}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    form.license_app_scope === opt.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Optional Details</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.fullname} onChange={set('fullname')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Hospital / Doctor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={form.username} onChange={set('username')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Username" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input type="tel" value={form.mobile} onChange={set('mobile')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="10-digit" pattern="[0-9]{10}" maxLength="10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input type="text" value={form.vendor_name} onChange={set('vendor_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Vendor / distributor" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={set('latitude')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="e.g. 28.6139" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={set('longitude')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="e.g. 77.2090" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !selectedPlanId}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating...' : 'Generate CT License'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CTCreateLicenseModal;
