import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { FileText, TrendingUp, DollarSign, Brain, Users, Monitor, AlertTriangle, Activity, Bell, Cpu, Key, Send } from 'lucide-react';

const ReportCard = ({ title, description, icon: Icon, onClick, badge }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 relative"
  >
    {badge && (
      <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
        {badge}
      </span>
    )}
    <div className="flex items-start gap-4">
      <div className="p-3 bg-primary-50 rounded-lg">
        <Icon size={24} className="text-primary-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const CTReportsList = () => {
  const navigate = useNavigate();
  const ctReports = [
    {
      id: 'ct-analyses',
      title: 'CT Analyses Report',
      description: 'View all CT scan analyses with status (completed, failed, processing, uploading, preparing), patient info, job IDs and error details',
      icon: Cpu,
      path: '/reports/ct-analyses',
      badge: 'CSV Export',
    },
    {
      id: 'ct-licenses',
      title: 'CT License Report',
      description: 'CT license credit balances, scan usage per license, expiry dates and assignment details',
      icon: Key,
      path: '/reports/ct-licenses',
      badge: 'CSV Export',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CT Reports</h1>
        <p className="text-gray-600 mt-1">Generate and download CT product reports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ctReports.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            badge={report.badge}
            onClick={() => navigate(report.path)}
          />
        ))}
      </div>
    </div>
  );
};

const ReportsList = () => {
  const { selectedProduct } = useProduct();
  const navigate = useNavigate();

  if (selectedProduct === 'ct') {
    return <CTReportsList />;
  }

  const reports = [
    {
      id: 'license-management',
      title: 'License Management Report',
      description: 'Comprehensive view of all licenses with status, activation dates, and user details',
      icon: FileText,
      path: '/reports/license-management',
      badge: 'CSV Export',
    },
    {
      id: 'revenue-payment',
      title: 'Revenue and Payment Report',
      description: 'Track revenue, payments, and financial transactions across all license purchases',
      icon: DollarSign,
      path: '/reports/revenue-payment',
      badge: 'CSV Export',
    },
    {
      id: 'usage-metrics',
      title: 'Usage Metrics Report',
      description: 'Track credit utilization and usage patterns across all active licenses',
      icon: TrendingUp,
      path: '/reports/usage-metrics',
      badge: 'CSV Export',
    },
    {
      id: 'ai-analysis',
      title: 'AI Analysis Report',
      description: 'View all AI predictions and analysis results from chest X-ray scans',
      icon: Brain,
      path: '/reports/ai-analysis',
      badge: 'CSV Export',
    },
    {
      id: 'demo-requests',
      title: 'Demo Requests',
      description: 'View all product demo requests submitted from the website with contact details and intent of use',
      icon: Send,
      path: '/reports/demo-requests',
      badge: 'CSV Export',
    },
    {
      id: 'user-activity',
      title: 'Registered Users',
      description: 'Monitor user registrations, activity, and engagement metrics',
      icon: Users,
      path: '/reports/user-activity',
      badge: 'CSV Export',
    },
    {
      id: 'desktop-sync',
      title: 'Desktop Sync Monitoring',
      description: 'Track desktop application sync status and data transfer logs',
      icon: Monitor,
      path: '/reports/desktop-sync',
      badge: 'CSV Export',
    },
    {
      id: 'system-health',
      title: 'System Health Monitoring',
      description: 'Real-time system status, database metrics, and performance indicators',
      icon: Activity,
      path: '/reports/system-health',
      badge: 'Live',
    },
    {
      id: 'notifications',
      title: 'Notification Tracking',
      description: 'Monitor notification delivery status, read rates, and user engagement',
      icon: Bell,
      path: '/reports/notifications',
      badge: 'CSV Export',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and download various reports for analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            badge={report.badge}
            onClick={() => navigate(report.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportsList;
