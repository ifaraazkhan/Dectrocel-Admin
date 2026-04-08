import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Activity, RefreshCw, ArrowLeft, Database, Users, Key, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SystemHealthReport = () => {
  const { selectedProduct } = useProduct();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isCT = selectedProduct === 'ct';

  useEffect(() => {
    fetchReport();
  }, [selectedProduct]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getSystemHealth(selectedProduct);
      if (response.status_code === 'dc200') {
        setData(response.results);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading system health...</div>
      </div>
    );
  }

  const stats = data?.database_stats || {};
  const recentActivity = data?.recent_activity || [];
  const errorCount = data?.error_count_24h || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <Activity size={28} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Health Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time system status and metrics</p>
          </div>
        </div>
        <button
          onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {errorCount > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">
                {errorCount} error{errorCount !== 1 ? 's' : ''} detected in the last 24 hours
              </p>
              {!isCT && <p className="text-xs text-red-600 mt-1">Check audit logs for details</p>}
            </div>
          </div>
        </div>
      )}

      {/* Database Stats */}
      <div className={`grid grid-cols-1 gap-6 mb-6 ${isCT ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-blue-600" />
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {parseInt(stats.total_users || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Key size={20} className="text-green-600" />
            <p className="text-sm text-gray-600">Total Licenses</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {parseInt(stats.total_licenses || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.available_licenses} available / {stats.active_licenses} active
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-purple-600" />
            <p className="text-sm text-gray-600">Total Reports</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {parseInt(stats.total_reports || 0).toLocaleString()}
          </p>
        </div>

        {!isCT && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database size={20} className="text-orange-600" />
              <p className="text-sm text-gray-600">Audit Logs</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {parseInt(stats.total_audit_logs || 0).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Credits Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credits Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Credits Available</p>
            <p className="text-3xl font-bold text-green-600">
              {parseInt(stats.total_credits_available || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span className="text-sm text-gray-600">{activity.date}</span>
                <span className="text-sm font-medium text-gray-900">
                  {activity.count} report{activity.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent activity</p>
        )}
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {data?.timestamp ? new Date(data.timestamp).toLocaleString() : '-'}
            </p>
          </div>
          {!isCT && (
            <div>
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-sm font-medium text-green-600 mt-1">
                {errorCount === 0 ? '✓ Healthy' : '⚠ Needs Attention'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthReport;
