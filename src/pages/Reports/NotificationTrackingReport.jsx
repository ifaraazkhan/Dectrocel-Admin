import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Download, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import ComingSoon from '../ComingSoon';

const NotificationTrackingReport = () => {
  const { selectedProduct } = useProduct();
  const navigate = useNavigate();
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
      const response = await reportsAPI.getNotifications();
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
      'Notification ID',
      'User Name',
      'Type',
      'Trigger Event',
      'Delivery Status',
      'Sent Date',
      'Read Status',
      'Read Date',
      'Created At',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.notification_id,
          row.user_name,
          row.notification_type,
          row.trigger_event || '-',
          row.delivery_status,
          row.sent_date,
          row.read_status ? 'Yes' : 'No',
          row.read_date,
          row.created_at,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-tracking-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Filter data
  const filteredData = data.filter(item =>
    item.user_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.notification_type?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.trigger_event?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.delivery_status?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: 'User Name',
      selector: row => row.user_name,
      sortable: true,
      grow: 2
    },
    {
      name: 'Type',
      selector: row => row.notification_type,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Trigger Event',
      selector: row => row.trigger_event || '-',
      sortable: true,
      width: '150px'
    },
    {
      name: 'Delivery Status',
      selector: row => row.delivery_status,
      sortable: true,
      width: '150px',
      cell: row => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.delivery_status === 'sent'
              ? 'bg-green-100 text-green-800'
              : row.delivery_status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.delivery_status}
        </span>
      )
    },
    {
      name: 'Sent Date',
      selector: row => row.sent_date,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Read Status',
      selector: row => row.read_status ? 'Read' : 'Unread',
      sortable: true,
      width: '120px',
      cell: row => (
        row.read_status ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Read
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            Unread
          </span>
        )
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
  const sentCount = data.filter((n) => n.delivery_status === 'sent').length;
  const readCount = data.filter((n) => n.read_status === true).length;

  if (selectedProduct === 'ct') {
    return <ComingSoon />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <Bell size={28} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Tracking</h1>
            <p className="text-gray-600 mt-1">
              {sentCount} sent / {readCount} read out of {data.length} total
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
          <p className="text-sm text-gray-600 mb-2">Total Notifications</p>
          <p className="text-2xl font-bold text-gray-900">{data.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Successfully Sent</p>
          <p className="text-2xl font-bold text-green-600">{sentCount}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.length > 0 ? ((sentCount / data.length) * 100).toFixed(1) : 0}% delivery rate
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Read by Users</p>
          <p className="text-2xl font-bold text-blue-600">{readCount}</p>
          <p className="text-xs text-gray-500 mt-1">
            {sentCount > 0 ? ((readCount / sentCount) * 100).toFixed(1) : 0}% read rate
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by user, type, event, or status..."
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
              <Bell size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No notification data found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default NotificationTrackingReport;
