import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { ctReportsAPI } from '../../api/ctAdmin';
import toast from 'react-hot-toast';

const CTLicenseReport = () => {
  const navigate = useNavigate();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

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
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/reports')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CT License Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Credit balance and usage per CT license</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="A">Available</option>
          <option value="U">In Use</option>
          <option value="R">Revoked</option>
          <option value="E">Expired</option>
        </select>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
        <button
          onClick={downloadCSV}
          disabled={data.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 ml-auto"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Licenses',    value: data.length },
          { label: 'Total CT Scans',    value: data.reduce((s, r) => s + (parseInt(r.total_scans) || 0), 0) },
          { label: 'Completed Scans',   value: data.reduce((s, r) => s + (parseInt(r.completed_scans) || 0), 0) },
          { label: 'Credits Remaining', value: data.reduce((s, r) => s + (parseInt(r.credits_remaining) || 0), 0) },
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full divide-y divide-gray-200 text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-36">License Key</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Credits</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Scope</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name / User</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">Mobile</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor / Location</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Expiry</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">Total</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">Done</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-400">
                    No CT licenses found
                  </td>
                </tr>
              ) : data.map((row, idx) => (
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
