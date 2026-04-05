import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Download, Users } from 'lucide-react';
import DataTable from 'react-data-table-component';
import ComingSoon from '../ComingSoon';

const UserActivityReport = () => {
  const { selectedProduct } = useProduct();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    if (selectedProduct === 'xray') {
      fetchReport();
    }
  }, [selectedProduct]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getUserActivity();
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
      'Mobile',
      'Account Type',
      'Registration Date',
      'Last Activity',
      'Total Licenses',
      'Total Reports',
      'Status',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.user_name || '-',
          row.mobile,
          row.account_type,
          row.registration_date,
          row.last_activity,
          row.total_licenses,
          row.total_reports,
          row.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Filter data
  const filteredData = data.filter(item =>
    item.user_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.mobile?.toString().includes(filterText) ||
    item.account_type?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.status?.toLowerCase().includes(filterText.toLowerCase())
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
      selector: row => row.mobile,
      sortable: true,
      width: '130px'
    },
    {
      name: 'Account Type',
      selector: row => row.account_type,
      sortable: true,
      width: '140px',
      cell: row => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.account_type === 'Doctor' ? 'bg-blue-100 text-blue-800' :
          row.account_type === 'Patient' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.account_type}
        </span>
      )
    },
    {
      name: 'Registration Date',
      selector: row => row.registration_date,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Last Activity',
      selector: row => row.last_activity,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Licenses',
      selector: row => parseInt(row.total_licenses) || 0,
      sortable: true,
      width: '100px',
      cell: row => <span className="font-medium">{parseInt(row.total_licenses) || 0}</span>
    },
    {
      name: 'Reports',
      selector: row => parseInt(row.total_reports) || 0,
      sortable: true,
      width: '100px',
      cell: row => <span className="font-medium">{parseInt(row.total_reports) || 0}</span>
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      width: '120px',
      cell: row => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
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

  // Summary calculations
  const activeUsers = data.filter(u => u.status === 'Active').length;
  const totalUsers = data.length;

  if (selectedProduct === 'ct') {
    return <ComingSoon />;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={28} className="text-primary-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900"> Registered Users</h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredData.length} user{filteredData.length !== 1 ? 's' : ''}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Active Users</p>
          <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}% of total
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by name, mobile, account type, or status..."
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
          responsive
          customStyles={customStyles}
          noDataComponent={
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No registered users found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default UserActivityReport;
