import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Download, BarChart3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';

const UsageMetricsReport = () => {
  const { selectedProduct } = useProduct();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchReport();
  }, [selectedProduct]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getUsageMetrics(selectedProduct);
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

  const exportToCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'User Name',
      'License Key',
      'Total Credits',
      'Credits Utilized',
      'Credits Available',
      'Utilization %',
      'Duration',
      'Last Sync',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.user_name,
          row.license_key,
          row.total_credits,
          row.credits_utilized,
          row.credits_available,
          row.total_credits > 0 ? ((row.credits_utilized / row.total_credits) * 100).toFixed(2) : '0',
          row.duration,
          row.last_sync,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-metrics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Filter data
  const filteredData = data.filter(item =>
    item.user_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.license_key?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: 'User Name',
      selector: row => row.user_name,
      sortable: true,
      grow: 2
    },
    {
      name: 'License Key',
      selector: row => row.license_key,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Total Credits',
      selector: row => parseInt(row.total_credits) || 0,
      sortable: true,
      width: '130px'
    },
    {
      name: 'Used',
      selector: row => parseInt(row.credits_utilized) || 0,
      sortable: true,
      width: '100px',
      cell: row => <span className="font-medium text-red-600">{parseInt(row.credits_utilized) || 0}</span>
    },
    {
      name: 'Available',
      selector: row => parseInt(row.credits_available) || 0,
      sortable: true,
      width: '120px',
      cell: row => <span className="font-medium text-green-600">{parseInt(row.credits_available) || 0}</span>
    },
    {
      name: 'Utilization',
      selector: row => {
        const total = parseInt(row.total_credits) || 0;
        const used = parseInt(row.credits_utilized) || 0;
        return total > 0 ? ((used / total) * 100).toFixed(1) : 0;
      },
      sortable: true,
      width: '180px',
      cell: row => {
        const total = parseInt(row.total_credits) || 0;
        const used = parseInt(row.credits_utilized) || 0;
        const percentage = total > 0 ? (used / total) * 100 : 0;
        const color = percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500';

        return (
          <div className="w-full">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
              </div>
              <span className="text-xs font-medium">{percentage.toFixed(1)}%</span>
            </div>
          </div>
        );
      }
    },
    {
      name: 'Duration',
      selector: row => row.duration,
      sortable: true,
      width: '120px'
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
  const totalCredits = data.reduce((sum, item) => sum + (parseInt(item.total_credits) || 0), 0);
  const totalUtilized = data.reduce((sum, item) => sum + (parseInt(item.credits_utilized) || 0), 0);
  const totalAvailable = data.reduce((sum, item) => sum + (parseInt(item.credits_available) || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <BarChart3 size={28} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usage Metrics Report</h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredData.length} license{filteredData.length !== 1 ? 's' : ''}
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
          <p className="text-sm text-gray-600 mb-2">Total Credits</p>
          <p className="text-3xl font-bold text-gray-900">{totalCredits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Credits Utilized</p>
          <p className="text-3xl font-bold text-red-600">{totalUtilized.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalCredits > 0 ? ((totalUtilized / totalCredits) * 100).toFixed(1) : 0}% used
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Credits Available</p>
          <p className="text-3xl font-bold text-green-600">{totalAvailable.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalCredits > 0 ? ((totalAvailable / totalCredits) * 100).toFixed(1) : 0}% remaining
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by user name or license key..."
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
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No usage data found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default UsageMetricsReport;
