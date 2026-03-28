import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Download, Key } from 'lucide-react';
import DataTable from 'react-data-table-component';
import ComingSoon from '../ComingSoon';

const LicenseManagementReport = () => {
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
      const response = await reportsAPI.getLicenseManagement();
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
      'Status',
      'Activation Date',
      'Expiry Date',
      'Plan',
      'Platform',
      'Vendor',
      'Location',
      'Last Sync',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.user_name || '-',
          row.license_key,
          row.license_status,
          row.activation_date,
          row.expiry_date,
          row.plan,
          row.platform,
          row.vendor_name,
          row.geo_location,
          row.last_sync,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `license-management-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Filter data based on search text
  const filteredData = data.filter(item =>
    item.user_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.license_key?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.license_status?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.plan?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.platform?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.vendor_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.geo_location?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: 'User Name',
      selector: row => row.user_name || '-',
      sortable: true,
      grow: 2
    },
    {
      name: 'License Key',
      selector: row => row.license_key,
      sortable: true,
      width: '180px',
      style: {
        fontWeight: '500'
      }
    },
    {
      name: 'Status',
      selector: row => row.license_status,
      sortable: true,
      width: '140px',
      cell: row => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.license_status === 'Available'
              ? 'bg-green-100 text-green-800'
              : row.license_status === 'In Use'
              ? 'bg-blue-100 text-blue-800'
              : row.license_status === 'Expired'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.license_status}
        </span>
      )
    },
    {
      name: 'Activation Date',
      selector: row => row.activation_date,
      sortable: true,
      width: '140px'
    },
    {
      name: 'Expiry Date',
      selector: row => row.expiry_date,
      sortable: true,
      width: '130px'
    },
    {
      name: 'Plan',
      selector: row => row.plan,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Platform',
      selector: row => row.platform,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Vendor',
      selector: row => row.vendor_name,
      sortable: true,
      width: '150px',
      omit: true // Hidden by default, can be toggled
    },
    {
      name: 'Location',
      selector: row => row.geo_location,
      sortable: true,
      width: '150px',
      omit: true // Hidden by default
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key size={28} className="text-primary-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">License Management Report</h1>
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

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by user, license key, status, plan, platform, vendor, or location..."
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
              <Key size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No licenses found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default LicenseManagementReport;
