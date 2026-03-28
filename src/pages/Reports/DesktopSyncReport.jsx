import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Download, Monitor } from 'lucide-react';
import DataTable from 'react-data-table-component';
import ComingSoon from '../ComingSoon';

const DesktopSyncReport = () => {
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
      const response = await reportsAPI.getDesktopSync();
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
      'License Number',
      'Patient Name',
      'Patient Age',
      'Patient Gender',
      'Report Date',
      'Has Image',
      'Has Heatmap',
      'Sync Status',
      'Synced At',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.license_number,
          row.patient_name || '-',
          row.patient_age || '-',
          row.patient_gender || '-',
          row.report_date,
          row.has_image ? 'Yes' : 'No',
          row.has_heatmap ? 'Yes' : 'No',
          row.sync_status,
          row.synced_at,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desktop-sync-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Filter data
  const filteredData = data.filter(item =>
    item.license_number?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.patient_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.patient_gender?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.sync_status?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: 'License Number',
      selector: row => row.license_number,
      sortable: true,
      width: '160px'
    },
    {
      name: 'Patient Name',
      selector: row => row.patient_name || '-',
      sortable: true,
      grow: 2
    },
    {
      name: 'Age',
      selector: row => row.patient_age || '-',
      sortable: true,
      width: '80px'
    },
    {
      name: 'Gender',
      selector: row => row.patient_gender || '-',
      sortable: true,
      width: '100px'
    },
    {
      name: 'Report Date',
      selector: row => row.report_date,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Image',
      selector: row => row.has_image ? 'Yes' : 'No',
      sortable: true,
      width: '100px',
      cell: row => (
        row.has_image ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Yes
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            No
          </span>
        )
      )
    },
    {
      name: 'Heatmap',
      selector: row => row.has_heatmap ? 'Yes' : 'No',
      sortable: true,
      width: '120px',
      cell: row => (
        row.has_heatmap ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Yes
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            No
          </span>
        )
      )
    },
    {
      name: 'Sync Status',
      selector: row => row.sync_status,
      sortable: true,
      width: '130px',
      cell: row => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.sync_status === 'Synced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.sync_status}
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
  const syncedCount = data.filter(r => r.sync_status === 'Synced').length;
  const pendingCount = data.filter(r => r.sync_status !== 'Synced').length;

  if (selectedProduct === 'ct') {
    return <ComingSoon />;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <Monitor size={28} className="text-primary-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Desktop Sync Monitoring</h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredData.length} report{filteredData.length !== 1 ? 's' : ''}
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
          <p className="text-sm text-gray-600 mb-2">Successfully Synced</p>
          <p className="text-3xl font-bold text-green-600">{syncedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Pending Sync</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by license number, patient name, gender, or status..."
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
              <Monitor size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No sync data found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DesktopSyncReport;
