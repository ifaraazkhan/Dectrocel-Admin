import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import reportsAPI from '../../api/reports';
import toast from 'react-hot-toast';
import { Download, Brain } from 'lucide-react';
import DataTable from 'react-data-table-component';
import ComingSoon from '../ComingSoon';

const AIAnalysisReport = () => {
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
      const response = await reportsAPI.getAIAnalysis();
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
      'Report ID',
      'License Number',
      'Patient Name',
      'Age',
      'Gender',
      'Analysis Date',
      'Has Heatmap',
      'Created At',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.id,
          row.license_number,
          row.patient_name || '-',
          row.patient_age || '-',
          row.patient_gender || '-',
          row.analysis_date,
          row.heatmap_image_s3_key ? 'Yes' : 'No',
          row.created_at,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analysis-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Filter data based on search text
  const filteredData = data.filter(item =>
    item.license_number?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.patient_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.patient_gender?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: 'License Number',
      selector: row => row.license_number,
      sortable: true,
      width: '180px'
    },
    {
      name: 'Patient Name',
      selector: row => row.patient_name || '-',
      sortable: true,
      grow: 2
    },
    {
      name: 'Age / Gender',
      sortable: true,
      width: '150px',
      cell: row => `${row.patient_age || '-'} / ${row.patient_gender || '-'}`
    },
    {
      name: 'Analysis Date',
      selector: row => row.analysis_date,
      sortable: true,
      width: '180px'
    },
    {
      name: 'Heatmap',
      selector: row => row.heatmap_image_s3_key ? 'Available' : 'N/A',
      sortable: true,
      width: '130px',
      cell: row => (
        row.heatmap_image_s3_key ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Available
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            N/A
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

  if (selectedProduct === 'ct') {
    return <ComingSoon />;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain size={28} className="text-primary-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI Analysis Report</h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredData.length} AI prediction{filteredData.length !== 1 ? 's' : ''}
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
            placeholder="Search by license number, patient name, or gender..."
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
              <Brain size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No AI analysis data found</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AIAnalysisReport;
