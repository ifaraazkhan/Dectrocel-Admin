import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import subscriptionsAPI from '../../api/subscriptions';
import toast from 'react-hot-toast';
import { Activity, TrendingUp, Users, CreditCard, RefreshCw } from 'lucide-react';
import DataTable from 'react-data-table-component';
import ComingSoon from '../ComingSoon';

const SubscriptionActivity = () => {
  const { selectedProduct } = useProduct();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProduct === 'xray') {
      fetchActivity();
    }
  }, [selectedProduct]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getActivity();
      if (response.status_code === 'dc200') {
        setData(response.results);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to fetch subscription activity');
    } finally {
      setLoading(false);
    }
  };

  const recentActivityColumns = [
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
      width: '150px',
      format: row => new Date(row.date).toLocaleDateString('en-GB')
    },
    {
      name: 'Subscriptions',
      selector: row => row.subscriptions_count,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Revenue (₹)',
      selector: row => `₹${parseInt(row.revenue).toLocaleString()}`,
      sortable: true,
      width: '150px'
    }
  ];

  const planDistributionColumns = [
    {
      name: 'Plan Name',
      selector: row => row.plan_name,
      sortable: true,
      grow: 2
    },
    {
      name: 'Price (₹)',
      selector: row => `₹${row.plan_cost}`,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Subscriptions',
      selector: row => row.subscription_count,
      sortable: true,
      width: '150px',
      cell: row => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {row.subscription_count} subs
        </span>
      )
    },
    {
      name: 'Revenue (₹)',
      selector: row => `₹${parseInt(row.revenue).toLocaleString()}`,
      sortable: true,
      width: '150px'
    }
  ];

  const usageStatsColumns = [
    {
      name: 'Date',
      selector: row => row.test_date,
      sortable: true,
      width: '150px',
      format: row => new Date(row.test_date).toLocaleDateString('en-GB')
    },
    {
      name: 'Total Tests',
      selector: row => row.total_tests,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Unique Users',
      selector: row => row.unique_users,
      sortable: true,
      width: '150px'
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
          backgroundColor: '#f9fafb'
        }
      }
    }
  };

  if (selectedProduct === 'ct') {
    return <ComingSoon />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading activity...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No activity data available</div>
      </div>
    );
  }

  const summary = data.summary || {};
  const recentActivity = data.recent_activity || [];
  const planDistribution = data.plan_distribution || [];
  const usageStats = data.usage_stats || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Activity size={28} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Activity</h1>
            <p className="text-gray-600 mt-1">Track usage metrics and revenue trends</p>
          </div>
        </div>
        <button
          onClick={fetchActivity}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Subscriptions</p>
            <CreditCard size={20} className="text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.total_subscriptions || 0}</p>
          <p className="text-xs text-green-600 mt-1">
            {summary.active_subscriptions || 0} active
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ₹{parseInt(summary.total_revenue || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Users</p>
            <Users size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summary.total_users || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Credits Remaining</p>
            <Activity size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {parseInt(summary.total_credits_remaining || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            of {parseInt(summary.total_credits_sold || 0).toLocaleString()} sold
          </p>
        </div>
      </div>

      {/* Recent Activity (Last 30 Days) */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity (Last 30 Days)</h2>
        </div>
        <DataTable
          columns={recentActivityColumns}
          data={recentActivity}
          pagination
          paginationPerPage={10}
          customStyles={customStyles}
          noDataComponent={
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
            </div>
          }
        />
      </div>

      {/* Plan Distribution */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Plan-wise Distribution</h2>
        </div>
        <DataTable
          columns={planDistributionColumns}
          data={planDistribution}
          pagination
          paginationPerPage={10}
          customStyles={customStyles}
          noDataComponent={
            <div className="text-center py-8">
              <p className="text-gray-500">No plan data available</p>
            </div>
          }
        />
      </div>

      {/* Usage Statistics (Last 30 Days) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Usage Statistics (Last 30 Days)</h2>
        </div>
        <DataTable
          columns={usageStatsColumns}
          data={usageStats}
          pagination
          paginationPerPage={10}
          customStyles={customStyles}
          noDataComponent={
            <div className="text-center py-8">
              <p className="text-gray-500">No usage data available</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default SubscriptionActivity;
