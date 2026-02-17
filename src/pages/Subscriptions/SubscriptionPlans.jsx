import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import subscriptionsAPI from '../../api/subscriptions';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, CreditCard, X } from 'lucide-react';
import DataTable from 'react-data-table-component';
import ComingSoon from '../ComingSoon';

const SubscriptionPlans = () => {
  const { selectedProduct } = useProduct();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_name: '',
    credits: '',
    validity_days: '',
    plan_cost: '',
    test_type_id: 1 // Default to X-ray
  });

  useEffect(() => {
    if (selectedProduct === 'xray') {
      fetchPlans();
    }
  }, [selectedProduct]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getPlans();
      if (response.status_code === 'dc200') {
        setData(response.results);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      plan_name: '',
      credits: '',
      validity_days: '',
      plan_cost: '',
      test_type_id: 1
    });
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setModalMode('edit');
    setSelectedPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      credits: plan.credits,
      validity_days: plan.validity_days,
      plan_cost: plan.plan_cost,
      test_type_id: plan.test_type_id
    });
    setShowModal(true);
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.plan_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await subscriptionsAPI.deletePlan(plan.plan_id);
      if (response.status_code === 'dc200') {
        toast.success('Plan deleted successfully');
        fetchPlans();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.plan_name || !formData.credits || !formData.validity_days || !formData.plan_cost) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        credits: parseInt(formData.credits),
        plan_cost: parseInt(formData.plan_cost),
        test_type_id: parseInt(formData.test_type_id)
      };

      if (modalMode === 'create') {
        const response = await subscriptionsAPI.createPlan(payload);
        if (response.status_code === 'dc200') {
          toast.success('Plan created successfully');
          setShowModal(false);
          fetchPlans();
        }
      } else {
        const response = await subscriptionsAPI.updatePlan(selectedPlan.plan_id, payload);
        if (response.status_code === 'dc200') {
          toast.success('Plan updated successfully');
          setShowModal(false);
          fetchPlans();
        }
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const columns = [
    {
      name: 'Plan ID',
      selector: row => row.plan_id,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Plan Name',
      selector: row => row.plan_name,
      sortable: true,
      grow: 2
    },
    {
      name: 'Credits',
      selector: row => row.credits,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Validity',
      selector: row => row.validity_days,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Cost (₹)',
      selector: row => `₹${row.plan_cost}`,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Active Subscriptions',
      selector: row => row.active_subscriptions || 0,
      sortable: true,
      width: '180px',
      cell: row => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {row.active_subscriptions || 0} active
        </span>
      )
    },
    {
      name: 'Actions',
      width: '150px',
      cell: row => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '2px solid #e5e7eb',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        color: '#6b7280'
      }
    },
    rows: {
      style: {
        fontSize: '14px',
        '&:hover': {
          backgroundColor: '#f9fafb',
          cursor: 'pointer'
        }
      }
    }
  };

  if (selectedProduct === 'ct') {
    return <ComingSoon />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <CreditCard size={28} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-gray-600 mt-1">Manage web app subscription plans</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Create Plan
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          customStyles={customStyles}
          noDataComponent={
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No subscription plans found</p>
            </div>
          }
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Create Subscription Plan' : 'Edit Subscription Plan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={formData.plan_name}
                    onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Basic Plan, Premium Plan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits *
                  </label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity Period *
                  </label>
                  <input
                    type="text"
                    value={formData.validity_days}
                    onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 30 days, 1 year"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.plan_cost}
                    onChange={(e) => setFormData({ ...formData, plan_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 999"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type *
                  </label>
                  <select
                    value={formData.test_type_id}
                    onChange={(e) => setFormData({ ...formData, test_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="1">X-ray</option>
                    <option value="2">CT Scan</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {modalMode === 'create' ? 'Create Plan' : 'Update Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
