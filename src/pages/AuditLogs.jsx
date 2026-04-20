import React, { useEffect, useState, useMemo } from 'react';
import { useProduct } from '../context/ProductContext';
import reportsAPI from '../api/reports';
import toast from 'react-hot-toast';
import { History, User, Clock, Search, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const SortIcon = ({ column, sortConfig }) => {
  if (sortConfig.key !== column) return <ChevronsUpDown size={13} className="text-gray-400 ml-1 inline" />;
  return sortConfig.direction === 'asc'
    ? <ChevronUp size={13} className="text-primary-600 ml-1 inline" />
    : <ChevronDown size={13} className="text-primary-600 ml-1 inline" />;
};

const AuditLogs = () => {
  const { selectedProduct } = useProduct();
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [search,     setSearch]     = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => setSortConfig(prev =>
    prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.trim().toLowerCase();
    return logs.filter(l =>
      l.action?.toLowerCase().includes(q) ||
      l.admin_name?.toLowerCase().includes(q) ||
      l.entity_type?.toLowerCase().includes(q) ||
      l.ip_address?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortConfig.key] ?? '';
      const bv = b[sortConfig.key] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortConfig]);

  const th = (label, key) => (
    <th onClick={() => handleSort(key)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">
      {label}<SortIcon column={key} sortConfig={sortConfig} />
    </th>
  );

  useEffect(() => {
    fetchLogs();
  }, [selectedProduct, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getAuditLogs({ page, limit: 50 });
      if (response.status_code === 'dc200') {
        setLogs(response.results.logs);
        setTotal(response.results.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'success' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Success
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Failed
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <History size={24} className="text-primary-600 flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all admin actions and system events</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 w-full sm:w-72">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search action, admin, entity..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {th('Timestamp', 'created_at')}
                {th('Admin',     'admin_name')}
                {th('Action',    'action')}
                {th('Entity',    'entity_type')}
                {th('Status',    'response_status')}
                {th('IP',        'ip_address')}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    {search ? 'No logs match your search' : 'No audit logs found'}
                  </td>
                </tr>
              ) : null}
              {sorted.map((log) => (
                <tr key={log.audit_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {formatDate(log.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      {log.admin_name || `User ${log.admin_user_id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <span className="text-gray-700">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-xs text-gray-400 ml-1">#{log.entity_id}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(log.response_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip_address || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {total > 50 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 50 >= total}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
