import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useProduct } from '../../context/ProductContext';
import { Plus, PackagePlus, ChevronUp, ChevronDown, ChevronsUpDown, Search, X, AlertTriangle } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import { ctLicensesAPI } from '../../api/ctAdmin';
import toast from 'react-hot-toast';

// X-ray components
import LicenseStatusBadge    from '../../components/licenses/LicenseStatusBadge';
import LicenseActionButtons  from '../../components/licenses/LicenseActionButtons';
import CreateLicenseModal    from '../../components/licenses/CreateLicenseModal';
import BulkGenerationModal   from '../../components/licenses/BulkGenerationModal';
import LicenseDetailModal    from '../../components/licenses/LicenseDetailModal';
import CarryForwardModal     from '../../components/licenses/CarryForwardModal';
import BlockLicenseModal     from '../../components/licenses/BlockLicenseModal';
import EditLicenseModal      from '../../components/licenses/EditLicenseModal';

// CT components
import CTCreateLicenseModal     from '../../components/licenses/CTCreateLicenseModal';
import CTLicenseDetailModal     from '../../components/licenses/CTLicenseDetailModal';
import CTBulkGenerationModal    from '../../components/licenses/CTBulkGenerationModal';

// ─── Sort helpers ─────────────────────────────────────────────────────────────

const SortIcon = ({ column, sortConfig }) => {
  if (sortConfig.key !== column)
    return <ChevronsUpDown size={13} className="text-gray-400 ml-1 inline" />;
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

// ─── X-ray License List ───────────────────────────────────────────────────────

const XrayLicenseList = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  // Search
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Sort
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Modals
  const [showCreateModal,       setShowCreateModal]       = useState(false);
  const [showBulkModal,         setShowBulkModal]         = useState(false);
  const [showDetailModal,       setShowDetailModal]       = useState(false);
  const [showEditModal,         setShowEditModal]         = useState(false);
  const [showCarryForwardModal, setShowCarryForwardModal] = useState(false);
  const [showBlockModal,        setShowBlockModal]        = useState(false);
  const [isUnblock,             setIsUnblock]             = useState(false);
  const [selectedLicense,       setSelectedLicense]       = useState(null);

  const fetchLicenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await licensesAPI.getAll({
        page,
        limit: 50,
        search: search.trim() || undefined,
        status: statusFilter  || undefined,
      });
      if (response.status_code === 'dc200') {
        setLicenses(response.results.licenses);
        setTotal(response.results.pagination.total);
      }
    } catch {
      toast.error('Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const sorted = useSortedData(licenses, sortConfig);

  // Expiry warning: licenses expiring in 0–10 days
  const [expiryDismissed, setExpiryDismissed] = useState(false);
  const expiringLicenses = useMemo(() => {
    const now = new Date();
    const limit = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    return licenses.filter(l => {
      if (!l.end_date) return false;
      const end = new Date(l.end_date);
      return end >= now && end <= limit;
    });
  }, [licenses]);

  useEffect(() => { setExpiryDismissed(false); }, [licenses]);

  const th = (label, key) => (
    <th
      onClick={() => handleSort(key)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap"
    >
      {label}<SortIcon column={key} sortConfig={sortConfig} />
    </th>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">License Management</h1>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} /> <span className="hidden xs:inline">Create</span><span className="xs:hidden">Create</span>
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
          >
            <PackagePlus size={16} /> <span>Bulk Generate</span>
          </button>
        </div>
      </div>

      {/* Expiry Warning Banner */}
      {!expiryDismissed && expiringLicenses.length > 0 && (
        <div className="mb-4 flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3">
          <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-yellow-800">
              {expiringLicenses.length} license{expiringLicenses.length > 1 ? 's' : ''} expiring within 10 days
            </p>
            <p className="text-xs text-yellow-700 mt-0.5 truncate">
              {expiringLicenses.map(l => l.license_key).join(', ')}
            </p>
          </div>
          <button onClick={() => setExpiryDismissed(true)} className="text-yellow-500 hover:text-yellow-700 flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search key, name, mobile..."
              className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 shrink-0">
            Search
          </button>
        </form>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="A">Available</option>
            <option value="U">In Use</option>
            <option value="CF">Carried Forward</option>
            <option value="R">Revoked</option>
            <option value="E">Expired</option>
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { clearSearch(); setStatusFilter(''); setPage(1); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 shrink-0">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {th('#', 'license_id')}
              {th('License Key', 'license_key')}
              {th('Status', 'status')}
              {th('Plan', 'plan_name')}
              {th('Plan ID', 'plan_id')}
              {th('Credits Left', 'credit_left')}
              {th('Vendor', 'vendor_name')}
              {th('Username', 'username')}
              {th('Start Date', 'start_date')}
              {th('End Date', 'end_date')}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-gray-400 text-sm">
                  {search || statusFilter ? 'No licenses match your filters' : 'No licenses found'}
                </td>
              </tr>
            ) : sorted.map((license) => (
              <tr key={license.license_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{license.license_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{license.license_key}</td>
                <td className="px-6 py-4 whitespace-nowrap"><LicenseStatusBadge status={license.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.plan_name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{license.plan_id ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{license.credit_left ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.vendor_name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.username || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.start_date ? new Date(license.start_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.end_date ? new Date(license.end_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LicenseActionButtons
                    license={license}
                    onViewDetails={(l) => { setSelectedLicense(l); setShowDetailModal(true); }}
                    onEdit={(l) => { setSelectedLicense(l); setShowEditModal(true); }}
                    onCarryForward={(l) => { setSelectedLicense(l); setShowCarryForwardModal(true); }}
                    onBlock={(l) => { setSelectedLicense(l); setIsUnblock(false); setShowBlockModal(true); }}
                    onUnblock={(l) => { setSelectedLicense(l); setIsUnblock(true); setShowBlockModal(true); }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 50 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} · {total} total</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateLicenseModal   isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchLicenses} />
      <BulkGenerationModal  isOpen={showBulkModal}   onClose={() => setShowBulkModal(false)}   onSuccess={fetchLicenses} />
      <EditLicenseModal
        isOpen={showEditModal} licenseId={selectedLicense?.license_id}
        onClose={() => { setShowEditModal(false); setSelectedLicense(null); }}
        onSuccess={fetchLicenses}
      />
      <LicenseDetailModal
        isOpen={showDetailModal} licenseId={selectedLicense?.license_id}
        onClose={() => { setShowDetailModal(false); setSelectedLicense(null); }}
        onCarryForward={(l) => { setSelectedLicense(l); setShowCarryForwardModal(true); }}
        onBlock={(l) => { setSelectedLicense(l); setIsUnblock(false); setShowBlockModal(true); }}
        onUnblock={(l) => { setSelectedLicense(l); setIsUnblock(true); setShowBlockModal(true); }}
      />
      <CarryForwardModal
        isOpen={showCarryForwardModal} license={selectedLicense}
        onClose={() => { setShowCarryForwardModal(false); setSelectedLicense(null); }}
        onSuccess={fetchLicenses}
      />
      <BlockLicenseModal
        isOpen={showBlockModal} license={selectedLicense} isUnblock={isUnblock}
        onClose={() => { setShowBlockModal(false); setSelectedLicense(null); setIsUnblock(false); }}
        onSuccess={fetchLicenses}
      />
    </div>
  );
};

// ─── CT License List ──────────────────────────────────────────────────────────

const STATUS_LABELS = { A: 'Available', U: 'In Use', R: 'Revoked', E: 'Expired' };
const SCOPE_LABELS  = { ct: 'CT Only', both: 'CT + X-ray' };

const CTLicenseList = () => {
  const [licenses,     setLicenses]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [searchInput,  setSearchInput]  = useState('');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig,   setSortConfig]   = useState({ key: null, direction: 'asc' });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal,   setShowBulkModal]   = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedId,      setSelectedId]      = useState(null);

  const fetchLicenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ctLicensesAPI.getAll({
        page, limit: 50,
        search: search.trim() || undefined,
        status: statusFilter  || undefined,
      });
      if (response.status_code === 'dc200') {
        setLicenses(response.results.licenses);
        setTotal(response.results.pagination.total);
      }
    } catch {
      toast.error('Failed to fetch CT licenses');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const sorted = useSortedData(licenses, sortConfig);

  // Expiry warning: CT licenses expiring in 0–10 days
  const [expiryDismissed, setExpiryDismissed] = useState(false);
  const expiringLicenses = useMemo(() => {
    const now = new Date();
    const limit = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    return licenses.filter(l => {
      if (!l.end_date) return false;
      const end = new Date(l.end_date);
      return end >= now && end <= limit;
    });
  }, [licenses]);

  useEffect(() => { setExpiryDismissed(false); }, [licenses]);

  const th = (label, key) => (
    <th
      onClick={() => handleSort(key)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap"
    >
      {label}<SortIcon column={key} sortConfig={sortConfig} />
    </th>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-gray-500">Loading CT licenses...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">CT License Management</h1>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} /> Create License
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
          >
            <PackagePlus size={16} /> Bulk Generate
          </button>
        </div>
      </div>

      {/* Expiry Warning Banner */}
      {!expiryDismissed && expiringLicenses.length > 0 && (
        <div className="mb-4 flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3">
          <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-yellow-800">
              {expiringLicenses.length} CT license{expiringLicenses.length > 1 ? 's' : ''} expiring within 10 days
            </p>
            <p className="text-xs text-yellow-700 mt-0.5 truncate">
              {expiringLicenses.map(l => l.license_key).join(', ')}
            </p>
          </div>
          <button onClick={() => setExpiryDismissed(true)} className="text-yellow-500 hover:text-yellow-700 flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search key, name, mobile..."
              className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 shrink-0">
            Search
          </button>
        </form>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="A">Available</option>
            <option value="U">In Use</option>
            <option value="R">Revoked</option>
            <option value="E">Expired</option>
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { clearSearch(); setStatusFilter(''); setPage(1); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 shrink-0">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {th('License Key', 'license_key')}
              {th('Status', 'status')}
              {th('CT Credits', 'ct_credits')}
              {th('Scope', 'license_app_scope')}
              {th('Name / Username', 'fullname')}
              {th('Mobile', 'mobile')}
              {th('Expiry', 'end_date')}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                  {search || statusFilter ? 'No CT licenses match your filters' : 'No CT licenses found'}
                </td>
              </tr>
            ) : sorted.map((lic) => (
              <tr key={lic.license_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{lic.license_key}</td>
                <td className="px-4 py-3 whitespace-nowrap"><LicenseStatusBadge status={lic.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{lic.ct_credits ?? 0}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {SCOPE_LABELS[lic.license_app_scope] || lic.license_app_scope}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lic.fullname || lic.username || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lic.mobile || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {lic.end_date ? new Date(lic.end_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => { setSelectedId(lic.license_id); setShowDetailModal(true); }}
                    className="text-xs px-3 py-1.5 font-medium text-primary-600 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 50 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} · {total} total</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <CTCreateLicenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => { setShowCreateModal(false); fetchLicenses(); }}
      />
      <CTBulkGenerationModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={fetchLicenses}
      />
      <CTLicenseDetailModal
        isOpen={showDetailModal}
        licenseId={selectedId}
        onClose={() => { setShowDetailModal(false); setSelectedId(null); }}
        onBlock={fetchLicenses}
        onUnblock={fetchLicenses}
      />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LicenseList = () => {
  const { selectedProduct } = useProduct();
  return selectedProduct === 'ct' ? <CTLicenseList /> : <XrayLicenseList />;
};

export default LicenseList;
