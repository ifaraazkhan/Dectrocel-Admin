import React, { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import { Plus, PackagePlus } from 'lucide-react';
import licensesAPI from '../../api/licenses';
import toast from 'react-hot-toast';
import ComingSoon from '../ComingSoon';

// Import components
import LicenseStatusBadge from '../../components/licenses/LicenseStatusBadge';
import LicenseActionButtons from '../../components/licenses/LicenseActionButtons';
import CreateLicenseModal from '../../components/licenses/CreateLicenseModal';
import BulkGenerationModal from '../../components/licenses/BulkGenerationModal';
import LicenseDetailModal from '../../components/licenses/LicenseDetailModal';
import CarryForwardModal from '../../components/licenses/CarryForwardModal';
import BlockLicenseModal from '../../components/licenses/BlockLicenseModal';

const LicenseList = () => {
  const { selectedProduct } = useProduct();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCarryForwardModal, setShowCarryForwardModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isUnblock, setIsUnblock] = useState(false);

  // Selected license for modals
  const [selectedLicense, setSelectedLicense] = useState(null);

  useEffect(() => {
    if (selectedProduct === 'xray') {
      fetchLicenses();
    }
  }, [selectedProduct, page]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await licensesAPI.getAll({ page, limit: 50 });
      if (response.status_code === 'dc200') {
        setLicenses(response.results.licenses);
        setTotal(response.results.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleViewDetails = (license) => {
    setSelectedLicense(license);
    setShowDetailModal(true);
  };

  const handleCarryForward = (license) => {
    setSelectedLicense(license);
    setShowCarryForwardModal(true);
  };

  const handleBlock = (license) => {
    setSelectedLicense(license);
    setIsUnblock(false);
    setShowBlockModal(true);
  };

  const handleUnblock = (license) => {
    setSelectedLicense(license);
    setIsUnblock(true);
    setShowBlockModal(true);
  };

  const handleSuccess = () => {
    fetchLicenses();
  };

  if (selectedProduct === 'ct') {
    return <ComingSoon />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            Create License
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
          >
            <PackagePlus size={18} />
            Bulk Generate
          </button>
        </div>
      </div>

      {/* License Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits Left
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map((license) => (
              <tr key={license.license_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {license.license_key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <LicenseStatusBadge status={license.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.plan_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.credit_left || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.username || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <LicenseActionButtons
                    license={license}
                    onViewDetails={handleViewDetails}
                    onCarryForward={handleCarryForward}
                    onBlock={handleBlock}
                    onUnblock={handleUnblock}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 50 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 50 >= total}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateLicenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
      />

      <BulkGenerationModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={handleSuccess}
      />

      <LicenseDetailModal
        isOpen={showDetailModal}
        licenseId={selectedLicense?.license_id}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedLicense(null);
        }}
        onCarryForward={handleCarryForward}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
      />

      <CarryForwardModal
        isOpen={showCarryForwardModal}
        license={selectedLicense}
        onClose={() => {
          setShowCarryForwardModal(false);
          setSelectedLicense(null);
        }}
        onSuccess={handleSuccess}
      />

      <BlockLicenseModal
        isOpen={showBlockModal}
        license={selectedLicense}
        onClose={() => {
          setShowBlockModal(false);
          setSelectedLicense(null);
          setIsUnblock(false);
        }}
        onSuccess={handleSuccess}
        isUnblock={isUnblock}
      />
    </div>
  );
};

export default LicenseList;
