import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from 'lucide-react';
import { ctReportsAPI } from '../../api/ctAdmin';
import toast from 'react-hot-toast';

const SortIcon = ({ column, sortConfig }) => {
  if (sortConfig.key !== column) return <ChevronsUpDown size={13} className="text-gray-400 ml-1 inline" />;
  return sortConfig.direction === 'asc'
    ? <ChevronUp size={13} className="text-primary-600 ml-1 inline" />
    : <ChevronDown size={13} className="text-primary-600 ml-1 inline" />;
};

const useSortedData = (data, sortConfig) =>
  useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const av = a[sortConfig.key] ?? '';
      const bv = b[sortConfig.key] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sortConfig]);

const CTLicenseReport = () => {
  const navigate = useNavigate();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [sortConfig,   setSortConfig]   = useState({ key: null, direction: 'asc' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ctReportsAPI.getLicenses({
        status: statusFilter || undefined,
      });
      if (response.status_code === 'dc200') {
        setData(response.results);
      }
    } catch (error) {
      console.error('Error fetching CT license report:', error);
      toast.error('Failed to fetch CT license report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleSort = (key) => setSortConfig(prev =>
    prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter(r =>
      r.license_key?.toLowerCase().includes(q) ||
      r.fullname?.toLowerCase().includes(q) ||
      r.username?.toLowerCase().includes(q) ||
      r.mobile?.toLowerCase().includes(q) ||
      r.vendor_name?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const sorted = useSortedData(filtered, sortConfig);

  const th = (label, key) => (
    <th onClick={() => handleSort(key)}
      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">
      {label}<SortIcon column={key} sortConfig={sortConfig} />
    </th>
  );

  const downloadCSV = () => {
    if (data.length === 0) return;
    const headers = [
      'License Key','Status','CT Credits Remaining','Scope',
      'Full Name','Username','Mobile','Vendor','Location',
      'Expiry Date','Last Sync','Total Scans','Completed','Failed',
    ];
    const rows = data.map((r) => [
      r.license_key,
      r.license_status,
      r.credits_remaining,
      r.license_app_scope,
      r.fullname,
      r.username,
      r.mobile,
      r.vendor_name,
      r.geo_location,
      r.expiry_date,
      r.last_sync,
      r.total_scans,
      r.completed_scans,
      r.failed_scans,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `ct_license_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const STATUS_BADGE = {
    Available: 'bg-green-100 text-green-800',
    'In Use':  'bg-blue-100 text-blue-800',
    Revoked:   'bg-red-100 text-red-800',
    Expired:   'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">CT License Report</h1>
            <p className="text-sm text-gray-500 mt-0.5">Credit balance and usage per CT license</p>
          </div>
        </div>
        <button
          onClick={downloadCSV}
          disabled={data.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3 mb-5">
        <div className="relative flex-1 sm:flex-none sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search key, name, mobile..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="A">Available</option>
            <option value="U">In Use</option>
            <option value="R">Revoked</option>
            <option value="E">Expired</option>
          </select>
          <button onClick={fetchData}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shrink-0">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Licenses',  value: data.length },
          { label: 'Total CT Scans',  value: data.reduce((s, r) => s + (parseInt(r.total_scans)       || 0), 0) },
          { label: 'Completed Scans', value: data.reduce((s, r) => s + (parseInt(r.completed_scans)   || 0), 0) },
          { label: 'Failed Scans',    value: data.reduce((s, r) => s + (parseInt(r.failed_scans)      || 0), 0) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {th('License Key',     'license_key')}
                {th('Status',          'license_status')}
                {th('Credits',         'credits_remaining')}
                {th('Scope',           'license_app_scope')}
                {th('Name / User',     'fullname')}
                {th('Mobile',          'mobile')}
                {th('Vendor',          'vendor_name')}
                {th('Expiry',          'expiry_date')}
                {th('Total',           'total_scans')}
                {th('Done',            'completed_scans')}
                {th('Failed',          'failed_scans')}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-400">
                    {search ? 'No results match your search' : 'No CT licenses found'}
                  </td>
                </tr>
              ) : sorted.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-mono text-xs text-gray-900 truncate" title={row.license_key}>{row.license_key}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_BADGE[row.license_status] || 'bg-gray-100 text-gray-700'}`}>
                      {row.license_status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-gray-900 text-xs">{row.credits_remaining}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {row.license_app_scope === 'both' ? 'CT+X-ray' : 'CT Only'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-900 truncate" title={row.fullname}>{row.fullname || '-'}</div>
                    <div className="text-xs text-gray-400 truncate" title={row.username}>{row.username || '-'}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 truncate">{row.mobile || '-'}</td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-900 truncate" title={row.vendor_name}>{row.vendor_name || '-'}</div>
                    <div className="text-xs text-gray-400 truncate" title={row.geo_location}>{row.geo_location || '-'}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 truncate">{row.expiry_date || '-'}</td>
                  <td className="px-3 py-3 text-center text-xs text-gray-900">{row.total_scans ?? 0}</td>
                  <td className="px-3 py-3 text-center text-xs text-green-700 font-medium">{row.completed_scans ?? 0}</td>
                  <td className="px-3 py-3 text-center text-xs text-red-600">{row.failed_scans ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 text-right">
        {data.length} licenses · Exported from live database
      </p>
    </div>
  );
};

export default CTLicenseReport;
