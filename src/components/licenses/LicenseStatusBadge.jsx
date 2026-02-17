import React from 'react';

const LicenseStatusBadge = ({ status }) => {
  const statusMap = {
    'A': { label: 'Available', color: 'bg-green-100 text-green-800' },
    'U': { label: 'In Use', color: 'bg-blue-100 text-blue-800' },
    'CF': { label: 'Carried Forward', color: 'bg-purple-100 text-purple-800' },
    'R': { label: 'Revoked', color: 'bg-red-100 text-red-800' },
    'E': { label: 'Expired', color: 'bg-gray-100 text-gray-800' },
  };

  const badge = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
      {badge.label}
    </span>
  );
};

export default LicenseStatusBadge;
