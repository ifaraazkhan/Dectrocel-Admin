import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import plansAPI from '../../api/plans';
import toast from 'react-hot-toast';

const BulkGenerationModal = ({ isOpen, onClose, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedLicenses, setGeneratedLicenses] = useState(null);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [form, setForm] = useState({
    num_licenses: '',
    vendor_name:  '',
    geo_location: '',
  });

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

  useEffect(() => {
    if (selectedPlanId) {
      const plan = plans.find(p => String(p.plan_id) === String(selectedPlanId));
      setSelectedPlan(plan || null);
    } else {
      setSelectedPlan(null);
    }
  }, [selectedPlanId, plans]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const num = parseInt(form.num_licenses);
    if (!num || num < 1) { toast.error('Enter a valid number of licenses (min 1)'); return false; }
    if (num > 1000) { toast.error('Maximum 1000 licenses per batch'); return false; }
    if (!selectedPlanId) { toast.error('Please select a plan'); return false; }
    if (!selectedPlan?.credits || selectedPlan.credits < 1) { toast.error('Selected plan has invalid credits'); return false; }
    if (!selectedPlan?.validity_days || parseInt(selectedPlan.validity_days) < 1) { toast.error('Selected plan has invalid validity'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    const num = parseInt(form.num_licenses);
    if (num > 100 && !showConfirmation) { setShowConfirmation(true); return; }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(selectedPlan.validity_days));
    const end_date = endDate.toISOString().split('T')[0];

    setLoading(true);
    try {
      const response = await licensesAPI.bulkCreate({
        num_licenses: num,
        credit_left:  selectedPlan.credits,
        end_date,
        plan_id:      parseInt(selectedPlanId),
        vendor_name:  form.vendor_name  || undefined,
        geo_location: form.geo_location || undefined,
      });

      if (response.status_code === 'dc200') {
        setGeneratedLicenses(response.results);
        toast.success(`${num} licenses generated successfully`);
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate licenses');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const downloadCSV = () => {
    if (!generatedLicenses?.length) return;
    const headers = ['License Key', 'Credits', 'Status', 'Created Date'];
    const rows = generatedLicenses.map(l => [
      l.license_key,
      l.credit_left || 0,
      l.status,
      new Date().toLocaleDateString(),
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xray_licenses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const handleClose = () => {
    setSelectedPlanId('');
    setSelectedPlan(null);
    setForm({ num_licenses: '', vendor_name: '', geo_location: '' });
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
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium">
                ✓ {generatedLicenses.length} X-ray licenses generated successfully
              </p>
              {selectedPlan && (
                <p className="text-blue-600 text-xs mt-1">Plan: {selectedPlan.plan_name}</p>
              )}
            </div>
            <div className="space-y-3">
              <button onClick={downloadCSV}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                <Download size={18} /> Download CSV
              </button>
              <button onClick={handleClose}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Close
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">License keys are ready for distribution</p>
          </div>
        </div>
      </div>
    );
  }

  // Confirm large batch
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Confirm Large Batch</h2>
            <button onClick={() => setShowConfirmation(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm text-yellow-800">
              You're about to generate <strong>{form.num_licenses}</strong> licenses
              with <strong>{selectedPlan?.credits} credits</strong> each. This may take a moment.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50">
                {loading ? 'Generating...' : 'Confirm & Generate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Bulk X-ray License Generation</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Licenses <span className="text-red-500">*</span>
            </label>
            <input
              type="number" value={form.num_licenses} onChange={set('num_licenses')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="e.g. 50" min="1" max="1000" required
            />
            <p className="text-xs text-gray-400 mt-1">Max 1000 per batch</p>
          </div>

          {/* Plan Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Plan <span className="text-red-500">*</span>
            </label>
            {plansLoading ? (
              <p className="text-sm text-gray-400">Loading plans...</p>
            ) : plans.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                No X-ray license plans found.{' '}
                <a href="/plans" className="underline font-medium">Create a plan first</a>.
              </div>
            ) : (
              <>
                <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  required
                >
                  <option value="">— Choose a plan —</option>
                  {plans.map(p => (
                    <option key={p.plan_id} value={p.plan_id}>
                      {p.plan_name} · {p.credits} credits · {p.validity_days} days
                    </option>
                  ))}
                </select>
                {selectedPlan && (
                  <div className="mt-2 bg-primary-50 border border-primary-100 rounded-md p-3 text-xs text-primary-800 flex gap-4">
                    <span>Credits: <strong>{selectedPlan.credits}</strong></span>
                    <span>Validity: <strong>{selectedPlan.validity_days} days</strong></span>
                    {form.num_licenses && <span>Total: <strong>{parseInt(form.num_licenses) * selectedPlan.credits} credits</strong></span>}
                  </div>
                )}
              </>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Vendor / Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
              <input type="text" value={form.vendor_name} onChange={set('vendor_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Applied to all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
              <input type="text" value={form.geo_location} onChange={set('geo_location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Applied to all" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !selectedPlanId}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Generating...' : 'Generate Licenses'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkGenerationModal;
