import React, { useEffect, useState } from 'react';
import { useProduct } from '../context/ProductContext';
import dashboardAPI from '../api/dashboard';
import subscriptionsAPI from '../api/subscriptions';
import { ctDashboardAPI } from '../api/ctAdmin';
import toast from 'react-hot-toast';
import { Key, Users, CreditCard, DollarSign, CheckCircle, XCircle, Loader, Coins } from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';
import UsageComparisonChart from '../components/dashboard/UsageComparisonChart';
import LicensesByCategoryModal from '../components/dashboard/LicensesByCategoryModal';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const STATUS_COLORS = {
  completed:  'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-800',
  processing: 'bg-blue-100 text-blue-800',
  uploading:  'bg-yellow-100 text-yellow-800',
  preparing:  'bg-gray-100 text-gray-700',
};

const CTDashboard = () => {
  const [ctStats, setCtStats] = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await ctDashboardAPI.getStats();
        if (resp.status_code === 'dc200') setCtStats(resp.results);
      } catch {
        toast.error('Failed to fetch CT dashboard stats');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const lic = ctStats?.licenses  || {};
  const ana = ctStats?.analyses  || {};
  const recent = ctStats?.recent_analyses || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">CT Dashboard</h1>

      {/* License stats */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Licenses</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Licenses"      value={lic.total_licenses        || 0} icon={Key}         color="bg-primary-600" />
        <StatCard title="In Use"              value={lic.in_use                || 0} icon={Users}        color="bg-blue-600"    />
        <StatCard title="Available"           value={lic.available             || 0} icon={CheckCircle}  color="bg-teal-600"    />
        <StatCard title="Credits Remaining"   value={lic.total_credits_remaining || 0} icon={Coins}     color="bg-blue-700"    />
      </div>

      {/* Analysis stats */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">CT Analyses</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Scans"     value={ana.total_scans  || 0} icon={Key}          color="bg-slate-600"   />
        <StatCard title="Completed"       value={ana.completed    || 0} icon={CheckCircle}   color="bg-teal-600"    />
        <StatCard title="Failed"          value={ana.failed       || 0} icon={XCircle}       color="bg-red-600"     />
        <StatCard title="In Progress"     value={ana.in_progress  || 0} icon={Loader}        color="bg-sky-500"     />
      </div>

      {/* Recent analyses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent CT Analyses</h2>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm">No analyses yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.patient_name || 'Unknown Patient'}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{item.license_key}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'}`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-400">{item.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { selectedProduct } = useProduct();
  const [stats, setStats] = useState(null);
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (selectedProduct === 'xray') {
      fetchStats();
    }
  }, [selectedProduct]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch both dashboard stats and subscription stats in parallel
      const [dashboardResponse, subscriptionResponse] = await Promise.all([
        dashboardAPI.getStats(),
        subscriptionsAPI.getActivity()
      ]);

      if (dashboardResponse.status_code === 'dc200') {
        setStats(dashboardResponse.results);
      }

      if (subscriptionResponse.status_code === 'dc200') {
        setSubscriptionStats(subscriptionResponse.results.summary);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  if (selectedProduct === 'ct') {
    return <CTDashboard />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const totalLicenses = stats?.licenses?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Licenses"
          value={totalLicenses}
          icon={Key}
          color="bg-primary-600"
        />
        <StatCard
          title="Active Subscriptions"
          value={subscriptionStats?.active_subscriptions || 0}
          icon={CreditCard}
          color="bg-sky-500"
        />
        <StatCard
          title="Subscription Revenue"
          value={`₹${subscriptionStats?.total_revenue || 0}`}
          icon={DollarSign}
          color="bg-blue-700"
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
          color="bg-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Comparison Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Low vs High Usage Comparison</h2>
          <p className="text-xs text-gray-500 mb-3">Click on any category to view licenses</p>
          <UsageComparisonChart
            data={stats?.usage_comparison}
            onCategoryClick={handleCategoryClick}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats?.activation_trends?.slice(-5).map((trend, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span className="text-sm text-gray-600">{formatDate(trend.date)}</span>
                <span className="text-sm font-medium text-gray-900">{trend.activations} activations</span>
              </div>
            ))}
            {!stats?.activation_trends?.length && (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Licenses by Category Modal */}
      <LicensesByCategoryModal
        isOpen={showCategoryModal}
        category={selectedCategory}
        onClose={() => {
          setShowCategoryModal(false);
          setSelectedCategory(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
