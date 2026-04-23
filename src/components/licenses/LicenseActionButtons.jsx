import React from 'react';
import { Eye, Pencil, ArrowRight, XCircle, CheckCircle } from 'lucide-react';

const LicenseActionButtons = ({ license, onViewDetails, onEdit, onCarryForward, onBlock, onUnblock }) => {
  return (
    <div className="flex items-center gap-0.5">
      {/* View Details - Always visible */}
      <button
        onClick={() => onViewDetails(license)}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="View full details"
      >
        <Eye size={15} />
      </button>

      {/* Edit Assignment Info */}
      <button
        onClick={() => onEdit && onEdit(license)}
        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Edit assignment information"
      >
        <Pencil size={15} />
      </button>

      {/* Carry Forward - Only if has credits remaining */}
      {license.credit_left > 0 && license.status !== 'CF' && license.status !== 'R' && (
        <button
          onClick={() => onCarryForward(license)}
          className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
          title="Carry forward credits"
        >
          <ArrowRight size={15} />
        </button>
      )}

      {/* Block - Only if not already revoked */}
      {license.status !== 'R' && (
        <button
          onClick={() => onBlock(license)}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Block/Revoke license"
        >
          <XCircle size={15} />
        </button>
      )}

      {/* Unblock - Only if revoked */}
      {license.status === 'R' && (
        <button
          onClick={() => onUnblock(license)}
          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
          title="Unblock license"
        >
          <CheckCircle size={15} />
        </button>
      )}
    </div>
  );
};

export default LicenseActionButtons;
