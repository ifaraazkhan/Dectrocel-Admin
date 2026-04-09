import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Download, DollarSign, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';

const RevenuePaymentReport = () => {
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
      const response = await reportsAPI.getRevenuePayment({}, selectedProduct);
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
      'User ID',
      'User Name',
      'Mobile',
      'License Key',
      'Plan Name',
      'Plan Price',
      'Purchase Date',
      'Payment Status',
      'Credits Purchased',
      'Credits Remaining',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.user_id || '-',
          row.user_name,
          row.mobile,
          row.license_key,
          row.plan_name,
          row.plan_price || '0',
          row.purchase_date,
          row.payment_status,
          row.credits_purchased || '0',
          row.credits_remaining || '0',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-payment-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Filter data
  const filteredData = data.filter(item =>
    item.user_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.mobile?.toString().includes(filterText) ||
    item.license_key?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.plan_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.payment_status?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: 'User Name',
      selector: row => row.user_name,
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
      name: 'License Key',
      selector: row => row.license_key,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Plan',
      selector: row => row.plan_name,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Price (₹)',
      selector: row => row.plan_price || 0,
      sortable: true,
      width: '120px',
      cell: row => <span className="font-medium">₹{row.plan_price || 0}</span>
    },
    {
      name: 'Credits',
      sortable: true,
      width: '160px',
      cell: row => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{row.credits_remaining || 0} left</div>
          <div className="text-xs text-gray-500">of {row.credits_purchased || 0}</div>
        </div>
      )
    },
    {
      name: 'Purchase Date',
      selector: row => row.purchase_date,
      sortable: true,
      width: '140px'
    },
    {
      name: 'Status',
      selector: row => row.payment_status,
      sortable: true,
      width: '120px',
      cell: row => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.payment_status === 'Completed' ? 'bg-green-100 text-green-800' :
          row.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.payment_status}
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
  const totalRevenue = data.reduce((sum, item) => sum + (parseInt(item.plan_price) || 0), 0);
  const totalTransactions = data.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <DollarSign size={28} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue and Payment Report</h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredData.length} transaction{filteredData.length !== 1 ? 's' : ''}
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
          <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-600">{totalTransactions}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by user, mobile, license key, plan, or status..."
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
              <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No payment data found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default RevenuePaymentReport;
