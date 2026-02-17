import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import dashboardAPI from '../../api/dashboard';
import toast from 'react-hot-toast';
import LicenseStatusBadge from '../licenses/LicenseStatusBadge';

const LicensesByCategoryModal = ({ isOpen, category, onClose }) => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && category) {
      fetchLicenses();
    }
  }, [isOpen, category]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLicensesByCategory(category);
      if (response.status_code === 'dc200') {
        setLicenses(response.results.licenses);
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to load licenses');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Color mapping for category badges
  const categoryColors = {
    'High Usage': 'bg-red-100 text-red-800',
    'Medium Usage': 'bg-yellow-100 text-yellow-800',
    'Low Usage': 'bg-green-100 text-green-800',
    'Unused': 'bg-blue-100 text-blue-800',
    'No Credits': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Licenses by Category</h2>
            <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded-full ${categoryColors[category]}`}>
              {category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading licenses...</div>
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No licenses found in this category</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="mb-4 text-sm text-gray-600">
                Showing <strong>{licenses.length}</strong> licenses
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        License Key
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {licenses.map((license) => (
                      <tr key={license.license_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {license.license_key}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <LicenseStatusBadge status={license.status} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {license.plan_name || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  license.usage_percentage >= 80 ? 'bg-red-500' :
                                  license.usage_percentage >= 50 ? 'bg-yellow-500' :
                                  license.usage_percentage > 0 ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${license.usage_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {license.usage_percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="text-gray-900">
                            <span className="font-medium">{license.credit_left}</span>
                            <span className="text-gray-400"> / {license.total_credits}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {license.credits_used} used
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {license.username || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicensesByCategoryModal;
