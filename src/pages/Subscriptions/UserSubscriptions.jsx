import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import subscriptionsAPI from '../../api/subscriptions';
import toast from 'react-hot-toast';
import { Download, Users } from 'lucide-react';
import DataTable from 'react-data-table-component';
import ComingSoon from '../ComingSoon';

const UserSubscriptions = () => {
  const { selectedProduct } = useProduct();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    if (selectedProduct === 'xray') {
      fetchSubscriptions();
    }
  }, [selectedProduct]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getUserSubscriptions();
      if (response.status_code === 'dc200') {
        setData(response.results);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch user subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Subscription ID',
      'User Name',
      'Mobile',
      'Plan Name',
      'Plan Credits',
      'Credits Used',
      'Credits Available',
      'Start Date',
      'End Date',
      'Status',
      'Transaction ID',
      'Plan Cost',
      'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.subscription_id,
          row.user_name || '-',
          row.mobile || '-',
          row.plan_name,
          row.plan_credits,
          row.credits_used,
          row.available_credit,
          row.start_date,
          row.end_date,
          row.status,
          row.pg_transaction_id || '-',
          row.plan_cost,
          row.created_at
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Filter data based on search text
  const filteredData = data.filter(item =>
    item.user_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.mobile?.toString().includes(filterText) ||
    item.plan_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.pg_transaction_id?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: 'User Name',
      selector: row => row.user_name || '-',
      sortable: true,
      grow: 2
    },
    {
      name: 'Mobile',
      selector: row => row.mobile || '-',
      sortable: true,
      width: '120px'
    },
    {
      name: 'Plan',
      selector: row => row.plan_name,
      sortable: true,
      grow: 1
    },
    {
      name: 'Credits',
      sortable: true,
      width: '180px',
      cell: row => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{row.available_credit} / {row.plan_credits}</div>
          <div className="text-xs text-gray-500">{row.credits_used} used</div>
        </div>
      )
    },
    {
      name: 'Start Date',
      selector: row => row.start_date,
      sortable: true,
      width: '120px'
    },
    {
      name: 'End Date',
      selector: row => row.end_date,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      width: '120px',
      cell: row => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : row.status === 'Expired'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      name: 'Cost (₹)',
      selector: row => `₹${row.plan_cost}`,
      sortable: true,
      width: '100px'
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

  // Summary calculations
  const totalSubscriptions = data.length;
  const activeSubscriptions = data.filter(s => s.status === 'Active').length;
  const totalRevenue = data.reduce((sum, s) => sum + (parseInt(s.plan_cost) || 0), 0);

  if (selectedProduct === 'ct') {
    return <ComingSoon />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Users size={28} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Subscriptions</h1>
            <p className="text-gray-600 mt-1">
              {totalSubscriptions} total subscriptions ({activeSubscriptions} active)
            </p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900">{totalSubscriptions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Active Subscriptions</p>
          <p className="text-2xl font-bold text-green-600">{activeSubscriptions}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalSubscriptions > 0 ? ((activeSubscriptions / totalSubscriptions) * 100).toFixed(1) : 0}% of total
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by name, mobile, plan, or transaction ID..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          progressPending={loading}
          pagination
          paginationPerPage={25}
          paginationRowsPerPageOptions={[25, 50, 100, 200]}
          highlightOnHover
          customStyles={customStyles}
          noDataComponent={
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No user subscriptions found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default UserSubscriptions;
