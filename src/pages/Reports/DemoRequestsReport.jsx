import React, { useEffect, useState } from 'react';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Download, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';

const PRODUCT_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'decxpert-mx', label: 'DecXpert MX' },
  { value: 'dectrocel-ax', label: 'DecXpert AX' },
  { value: 'dectrocel-ct', label: 'DecXpert CT' },
  { value: 'my-lgp-health', label: 'My LGP Health' },
];

const customStyles = {
  headRow: {
    style: {
      backgroundColor: '#f9fafb',
      borderBottom: '2px solid #e5e7eb',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      color: '#6b7280',
    },
  },
  rows: {
    style: {
      fontSize: '14px',
      '&:hover': {
        backgroundColor: '#f9fafb',
        cursor: 'pointer',
      },
    },
  },
};

const DemoRequestsReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [productFilter, setProductFilter] = useState('all');

  useEffect(() => {
    fetchReport();
  }, [productFilter]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (productFilter !== 'all') params.product_id = productFilter;
      const response = await reportsAPI.getDemoRequests(params);
      if (response.status_code === 'dc200') {
        setData(response.results);
      }
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      toast.error('Failed to fetch demo requests');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['ID', 'Name', 'Organization', 'Email', 'Contact Number', 'Product', 'Version', 'Intent of Use', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map((row) =>
        [
          row.id,
          `"${row.name}"`,
          `"${row.organization_name}"`,
          row.email,
          row.contact_number,
          `"${row.product_name}"`,
          row.version,
          `"${row.intent_of_use?.replace(/"/g, '""')}"`,
          row.submitted_at,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demo-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.email?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.organization_name?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: '#',
      selector: (row) => row.id,
      sortable: true,
      width: '70px',
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      grow: 1,
    },
    {
      name: 'Organization',
      selector: (row) => row.organization_name,
      sortable: true,
      grow: 1,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      grow: 1,
    },
    {
      name: 'Contact',
      selector: (row) => row.contact_number,
      width: '130px',
    },
    {
      name: 'Product',
      selector: (row) => row.product_name,
      sortable: true,
      width: '150px',
    },
    {
      name: 'Version',
      selector: (row) => row.version,
      width: '90px',
    },
    {
      name: 'Intent of Use',
      selector: (row) => row.intent_of_use,
      grow: 2,
      wrap: true,
      cell: (row) => (
        <div className="py-2 text-sm text-gray-600 leading-snug">{row.intent_of_use}</div>
      ),
    },
    {
      name: 'Submitted At',
      selector: (row) => row.submitted_at,
      sortable: true,
      width: '160px',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <Send size={28} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demo Requests</h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredData.length} request{filteredData.length !== 1 ? 's' : ''}
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, email or organization..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {PRODUCT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          progressPending={loading}
          pagination
          paginationPerPage={25}
          paginationRowsPerPageOptions={[25, 50, 100]}
          highlightOnHover
          customStyles={customStyles}
          noDataComponent={
            <div className="text-center py-12">
              <Send size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No demo requests found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DemoRequestsReport;
