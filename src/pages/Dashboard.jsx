import React, { useEffect, useState } from 'react';
import { useProduct } from '../context/ProductContext';
import dashboardAPI from '../api/dashboard';
import subscriptionsAPI from '../api/subscriptions';
import toast from 'react-hot-toast';
import { Key, Users, CreditCard, DollarSign } from 'lucide-react';
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

const ComingSoon = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-700">Coming Soon</h2>
      <p className="text-gray-500 mt-2">CT product dashboard will be available soon</p>
    </div>
  </div>
);

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
    return <ComingSoon />;
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
          color="bg-green-600"
        />
        <StatCard
          title="Subscription Revenue"
          value={`₹${subscriptionStats?.total_revenue || 0}`}
          icon={DollarSign}
          color="bg-orange-600"
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
          color="bg-purple-600"
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
