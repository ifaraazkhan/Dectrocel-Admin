import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from 'lucide-react';
import plansAPI from '../../api/plans';
import toast from 'react-hot-toast';
import { useProduct } from '../../context/ProductContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_TABS = [
  { key: 'xray_license', label: 'X-ray License Plans', testTypeId: 1 },
  { key: 'ct_license',   label: 'CT License Plans',    testTypeId: 2 },
  { key: 'subscription', label: 'Web Subscription Plans', testTypeId: null },
];

const VALIDITY_PRESETS = [30, 90, 180, 365, 730];

// ─── Sort helpers ─────────────────────────────────────────────────────────────

const SortIcon = ({ column, sortConfig }) => {
  if (sortConfig.key !== column)
    return <ChevronsUpDown size={14} className="text-gray-400 ml-1 inline" />;
  return sortConfig.direction === 'asc'
    ? <ChevronUp size={14} className="text-primary-600 ml-1 inline" />
    : <ChevronDown size={14} className="text-primary-600 ml-1 inline" />;
};

const useSortedData = (data, sortConfig) =>
  useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const av = a[sortConfig.key] ?? '';
      const bv = b[sortConfig.key] ?? '';
      const cmp = typeof av === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sortConfig]);

// ─── Plan Modal (Create / Edit) ───────────────────────────────────────────────

const PlanModal = ({ isOpen, plan, planType, onClose, onSuccess }) => {
  const isEdit = !!plan;
  const tab = PLAN_TABS.find(t => t.key === planType) || PLAN_TABS[0];

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    plan_name:    '',
    credits:      '',
    validity_days: '',
    plan_cost:    '',
  });

  useEffect(() => {
    if (plan) {
      setForm({
        plan_name:    plan.plan_name    || '',
        credits:      plan.credits      ?? '',
        validity_days: plan.validity_days ?? '',
        plan_cost:    plan.plan_cost    ?? '',
      });
    } else {
      setForm({ plan_name: '', credits: '', validity_days: '', plan_cost: '' });
    }
  }, [plan, isOpen]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plan_name.trim()) { toast.error('Plan name is required'); return; }
    if (!form.credits || parseInt(form.credits) < 1) { toast.error('Credits must be ≥ 1'); return; }
    if (!form.validity_days || parseInt(form.validity_days) < 1) { toast.error('Validity must be ≥ 1 day'); return; }

    setLoading(true);
    try {
      const payload = {
        plan_name:    form.plan_name.trim(),
        credits:      parseInt(form.credits),
        validity_days: String(parseInt(form.validity_days)),
        plan_cost:    parseInt(form.plan_cost) || 0,
        plan_type:    planType,
        test_type_id: tab.testTypeId || 1,
      };

      const resp = isEdit
        ? await plansAPI.update(plan.plan_id, payload)
        : await plansAPI.create(payload);

      if (resp.status_code === 'dc200') {
        toast.success(isEdit ? 'Plan updated' : 'Plan created');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Plan' : `New ${tab.label.replace(' Plans', '')} Plan`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.plan_name} onChange={set('plan_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="e.g. Standard 500 Credits"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {planType === 'ct_license' ? 'CT Credits' : 'Credits'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number" value={form.credits} onChange={set('credits')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="e.g. 500" min="1" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validity (days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number" value={form.validity_days} onChange={set('validity_days')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="e.g. 365" min="1" required
              />
              <div className="flex gap-1 mt-1 flex-wrap">
                {VALIDITY_PRESETS.map(d => (
                  <button
                    key={d} type="button"
                    onClick={() => setForm(f => ({ ...f, validity_days: String(d) }))}
                    className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                      String(form.validity_days) === String(d)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 text-gray-500 hover:border-primary-400'
                    }`}
                  >{d}d</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Cost (₹) {planType === 'subscription' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number" value={form.plan_cost} onChange={set('plan_cost')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder={planType === 'subscription' ? 'e.g. 5000' : '0 (internal/free)'}
              min="0"
            />
            {planType !== 'subscription' && (
              <p className="text-xs text-gray-400 mt-1">Optional for license plans — used for reporting only</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteModal = ({ plan, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const resp = await plansAPI.delete(plan.plan_id);
      if (resp.status_code === 'dc200') {
        toast.success('Plan deleted');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete plan — it may have active licenses or subscriptions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Plan</h3>
        <p className="text-sm text-gray-600 mb-1">
          Are you sure you want to delete <strong>{plan.plan_name}</strong>?
        </p>
        <p className="text-xs text-red-600 mb-6">
          This will fail if any active licenses or subscriptions use this plan.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Plans Table ──────────────────────────────────────────────────────────────

const PlansTable = ({ plans, onEdit, onDelete, sortConfig, onSort }) => {
  const sorted = useSortedData(plans, sortConfig);

  const th = (label, key) => (
    <th
      onClick={() => onSort(key)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
    >
      {label}<SortIcon column={key} sortConfig={sortConfig} />
    </th>
  );

  if (plans.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No plans yet. Create your first plan.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {th('Plan Name', 'plan_name')}
            {th('Credits', 'credits')}
            {th('Validity (days)', 'validity_days')}
            {th('Cost (₹)', 'plan_cost')}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sorted.map((plan) => (
            <tr key={plan.plan_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{plan.plan_name}</td>
              <td className="px-4 py-3 text-sm text-gray-700 font-mono">{plan.credits?.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {plan.validity_days} days
                <span className="text-xs text-gray-400 ml-1">
                  ({Math.round(parseInt(plan.validity_days) / 30)} mo)
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {plan.plan_cost > 0 ? `₹${plan.plan_cost.toLocaleString()}` : <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(plan)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 font-medium text-primary-600 border border-primary-200 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(plan)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PlansList = () => {
  const { selectedProduct } = useProduct();

  // Default tab based on current product
  const defaultTab = selectedProduct === 'ct' ? 'ct_license' : 'xray_license';
  const [activeTab, setActiveTab]         = useState(defaultTab);
  const [allPlans, setAllPlans]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [sortConfig, setSortConfig]       = useState({ key: 'plan_id', direction: 'asc' });
  const [search, setSearch]               = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPlan, setEditPlan]               = useState(null);
  const [deletePlan, setDeletePlan]           = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const resp = await plansAPI.getAll();
      if (resp.status_code === 'dc200') {
        setAllPlans(resp.results || []);
      }
    } catch {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  // Filter plans by active tab then by search text
  const tabPlans = useMemo(() => {
    const byTab = allPlans.filter(p => (p.plan_type || 'subscription') === activeTab);
    if (!search.trim()) return byTab;
    const q = search.trim().toLowerCase();
    return byTab.filter(p =>
      p.plan_name?.toLowerCase().includes(q) ||
      String(p.credits).includes(q) ||
      String(p.validity_days).includes(q)
    );
  }, [allPlans, activeTab, search]);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const currentTab = PLAN_TABS.find(t => t.key === activeTab);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage license templates and web subscription plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} /> New Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {PLAN_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSortConfig({ key: 'plan_id', direction: 'asc' }); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {allPlans.filter(p => (p.plan_type || 'subscription') === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 w-full sm:w-72">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search plans..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading plans...</div>
      ) : (
        <PlansTable
          plans={tabPlans}
          sortConfig={sortConfig}
          onSort={handleSort}
          onEdit={setEditPlan}
          onDelete={setDeletePlan}
        />
      )}

      {/* Modals */}
      <PlanModal
        isOpen={showCreateModal}
        plan={null}
        planType={activeTab}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchPlans}
      />
      {editPlan && (
        <PlanModal
          isOpen={!!editPlan}
          plan={editPlan}
          planType={editPlan.plan_type || activeTab}
          onClose={() => setEditPlan(null)}
          onSuccess={() => { fetchPlans(); setEditPlan(null); }}
        />
      )}
      {deletePlan && (
        <DeleteModal
          plan={deletePlan}
          onClose={() => setDeletePlan(null)}
          onSuccess={() => { fetchPlans(); setDeletePlan(null); }}
        />
      )}
    </div>
  );
};

export default PlansList;
