import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { ctReportsAPI } from '../../api/ctAdmin';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  completed:  'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-800',
  processing: 'bg-blue-100 text-blue-800',
  uploading:  'bg-yellow-100 text-yellow-800',
  preparing:  'bg-gray-100 text-gray-700',
};

const CTAnalysesReport = () => {
  const navigate = useNavigate();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [page,         setPage]         = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ctReportsAPI.getAnalyses({
        status_filter: statusFilter,
        search:        search || undefined,
        page,
        limit:         100,
      });
      if (response.status_code === 'dc200') {
        setData(response.results);
      }
    } catch (error) {
      console.error('Error fetching CT analyses report:', error);
      toast.error('Failed to fetch CT analyses report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter, search, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const downloadCSV = () => {
    if (data.length === 0) return;
    const headers = [
      'License Key','Patient Name','Age','Gender','Status',
      'Analysis ID','Job ID','Created At','Completed At','Error',
    ];
    const rows = data.map((r) => [
      r.license_key,
      r.patient_name  || '-',
      r.patient_age   || '-',
      r.patient_gender|| '-',
      r.status,
      r.analysis_id   || '-',
      r.job_id        || '-',
      r.created_at    || '-',
      r.analysis_completed_at || '-',
      (r.error_message || '-').replace(/,/g, ';'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `ct_analyses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const STATUS_FILTERS = ['all','completed','failed','processing','uploading','preparing'];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/reports')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CT Analyses Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">All CT scan analyses across all licenses</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        {/* Status chips */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search patient, license, analysis ID..."
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-60"
          />
          <button type="submit" className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700">
            Search
          </button>
        </form>

        {/* Action buttons */}
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
        <button
          onClick={downloadCSV}
          disabled={data.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {['all','completed','failed','processing','uploading'].map((s) => {
          const count = s === 'all' ? data.length : data.filter(r => r.status === s).length;
          return (
            <div key={s} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 capitalize">{s === 'all' ? 'Showing' : s}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full divide-y divide-gray-200 text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">#</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">License Key</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Patient</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">Age</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Gender</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">Analysis ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Created At</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Completed At</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
              ) : data.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-900 truncate" title={row.license_key}>{row.license_key}</td>
                  <td className="px-3 py-3 text-gray-900 truncate" title={row.patient_name}>{row.patient_name || '-'}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{row.patient_age || '-'}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs truncate">{row.patient_gender || '-'}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-500 truncate" title={row.analysis_id}>{row.analysis_id || '-'}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{row.created_at || '-'}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{row.analysis_completed_at || '-'}</td>
                  <td className="px-3 py-3 text-xs text-red-600 truncate" title={row.error_message || ''}>{row.error_message || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 text-right">
        Showing {data.length} records
      </p>
    </div>
  );
};

export default CTAnalysesReport;
