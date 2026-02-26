import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import { Plus, PackagePlus } from 'lucide-react';
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

// CT components
import CTCreateLicenseModal  from '../../components/licenses/CTCreateLicenseModal';
import CTLicenseDetailModal  from '../../components/licenses/CTLicenseDetailModal';

// ─── X-ray License List ───────────────────────────────────────────────────────

const XrayLicenseList = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  const [showCreateModal,      setShowCreateModal]      = useState(false);
  const [showBulkModal,        setShowBulkModal]        = useState(false);
  const [showDetailModal,      setShowDetailModal]      = useState(false);
  const [showCarryForwardModal,setShowCarryForwardModal] = useState(false);
  const [showBlockModal,       setShowBlockModal]       = useState(false);
  const [isUnblock,            setIsUnblock]            = useState(false);
  const [selectedLicense,      setSelectedLicense]      = useState(null);

  useEffect(() => { fetchLicenses(); }, [page]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await licensesAPI.getAll({ page, limit: 50 });
      if (response.status_code === 'dc200') {
        setLicenses(response.results.licenses);
        setTotal(response.results.pagination.total);
      }
    } catch (error) {
      toast.error('Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} /> Create License
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
          >
            <PackagePlus size={18} /> Bulk Generate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['License Key','Status','Plan','Credits Left','Username','Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map((license) => (
              <tr key={license.license_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{license.license_key}</td>
                <td className="px-6 py-4 whitespace-nowrap"><LicenseStatusBadge status={license.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.plan_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.credit_left ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.username || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LicenseActionButtons
                    license={license}
                    onViewDetails={(l) => { setSelectedLicense(l); setShowDetailModal(true); }}
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

      {total > 50 && (
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Next
          </button>
        </div>
      )}

      <CreateLicenseModal   isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchLicenses} />
      <BulkGenerationModal  isOpen={showBulkModal}   onClose={() => setShowBulkModal(false)}   onSuccess={fetchLicenses} />
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
  const [licenses,       setLicenses]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [page,           setPage]           = useState(1);
  const [total,          setTotal]          = useState(0);
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedId,      setSelectedId]      = useState(null);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await ctLicensesAPI.getAll({
        page, limit: 50,
        search:     search.trim() || undefined,
        status:     statusFilter  || undefined,
      });
      if (response.status_code === 'dc200') {
        setLicenses(response.results.licenses);
        setTotal(response.results.pagination.total);
      }
    } catch (error) {
      toast.error('Failed to fetch CT licenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLicenses(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLicenses();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-gray-500">Loading CT licenses...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CT License Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} /> Create CT License
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search license key, name, mobile..."
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
          />
          <button type="submit" className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="A">Available</option>
          <option value="U">In Use</option>
          <option value="R">Revoked</option>
          <option value="E">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['License Key','Status','CT Credits','Scope','Name / Username','Mobile','Expiry','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No CT licenses found
                </td>
              </tr>
            ) : licenses.map((lic) => (
              <tr key={lic.license_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{lic.license_key}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <LicenseStatusBadge status={lic.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{lic.ct_credits ?? 0}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {SCOPE_LABELS[lic.license_app_scope] || lic.license_app_scope}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {lic.fullname || lic.username || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lic.mobile || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {lic.end_date ? new Date(lic.end_date).toLocaleDateString() : '-'}
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
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">Page {page} · {total} total</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Next
          </button>
        </div>
      )}

      <CTCreateLicenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => { setShowCreateModal(false); fetchLicenses(); }}
      />
      <CTLicenseDetailModal
        isOpen={showDetailModal}
        licenseId={selectedId}
        onClose={() => { setShowDetailModal(false); setSelectedId(null); }}
        onBlock={() => fetchLicenses()}
        onUnblock={() => fetchLicenses()}
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
