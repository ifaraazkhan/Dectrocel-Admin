import React, { useState, useEffect } from 'react';
import { X, BookOpen, Pencil } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import plansAPI from '../../api/plans';
import toast from 'react-hot-toast';

const VALIDITY_PRESETS = [30, 90, 180, 365, 730];

const CreateLicenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('plan'); // 'plan' | 'manual'
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [form, setForm] = useState({
    credit_left:   '',
    validity_days: '',
    fullname:      '',
    username:      '',
    mobile:        '',
    vendor_name:   '',
    geo_location:  '',
  });

  // Load X-ray license plans
  useEffect(() => {
    if (!isOpen) return;
    setPlansLoading(true);
    plansAPI.getByType('xray_license')
      .then(resp => {
        if (resp.status_code === 'dc200') setPlans(resp.results || []);
      })
      .catch(() => toast.error('Could not load plans'))
      .finally(() => setPlansLoading(false));
  }, [isOpen]);

  // When plan is selected, preview its values
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

    const credits = mode === 'plan'
      ? selectedPlan?.credits
      : parseInt(form.credit_left);

    const validityDays = mode === 'plan'
      ? parseInt(selectedPlan?.validity_days)
      : parseInt(form.validity_days);

    if (!credits || credits < 1) {
      toast.error('Credits must be at least 1'); return;
    }
    if (!validityDays || validityDays < 1) {
      toast.error('Validity must be at least 1 day'); return;
    }

    // Calculate end_date from validity_days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + validityDays);
    const end_date = endDate.toISOString().split('T')[0];

    setLoading(true);
    try {
      const payload = {
        credit_left:  credits,
        end_date,
        plan_id:      mode === 'plan' ? parseInt(selectedPlanId) : undefined,
        fullname:     form.fullname     || undefined,
        username:     form.username     || undefined,
        mobile:       form.mobile       || undefined,
        vendor_name:  form.vendor_name  || undefined,
        geo_location: form.geo_location || undefined,
      };

      const response = await licensesAPI.createSingle(payload);
      if (response.status_code === 'dc200') {
        const newLicense = response.results;
        toast.success(`License created: ${newLicense.license_key}`);
        navigator.clipboard.writeText(newLicense.license_key).catch(() => {});
        toast.success('License key copied to clipboard');
        onSuccess(newLicense);
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create license');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMode('plan');
    setSelectedPlanId('');
    setSelectedPlan(null);
    setForm({ credit_left: '', validity_days: '', fullname: '', username: '', mobile: '', vendor_name: '', geo_location: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create X-ray License</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('plan')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                mode === 'plan'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen size={15} /> From Plan
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Pencil size={15} /> Manual Entry
            </button>
          </div>

          {/* Plan Mode */}
          {mode === 'plan' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Plan <span className="text-red-500">*</span>
              </label>
              {plansLoading ? (
                <p className="text-sm text-gray-400">Loading plans...</p>
              ) : plans.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                  No X-ray license plans found.{' '}
                  <a href="/plans" className="underline font-medium">Create a plan first</a> or switch to Manual Entry.
                </div>
              ) : (
                <>
                  <select
                    value={selectedPlanId}
                    onChange={e => setSelectedPlanId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    required={mode === 'plan'}
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
                        <span>Credits</span>
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
          )}

          {/* Manual Mode */}
          {mode === 'manual' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credits <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" value={form.credit_left} onChange={set('credit_left')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="e.g. 500" min="1" required={mode === 'manual'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity (days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" value={form.validity_days} onChange={set('validity_days')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="e.g. 365" min="1" required={mode === 'manual'}
                />
                <div className="flex gap-1 mt-1 flex-wrap">
                  {VALIDITY_PRESETS.map(d => (
                    <button key={d} type="button"
                      onClick={() => setForm(f => ({ ...f, validity_days: String(d) }))}
                      className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                        String(form.validity_days) === String(d)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 text-gray-500 hover:border-primary-400'
                      }`}
                    >{d}d</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Optional Fields */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geo Location</label>
            <input type="text" value={form.geo_location} onChange={set('geo_location')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="City / State / Country" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || (mode === 'plan' && !selectedPlanId && plans.length > 0)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating...' : 'Generate License'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLicenseModal;
