import React from 'react';
import { Eye, ArrowRight, XCircle, CheckCircle } from 'lucide-react';

const LicenseActionButtons = ({ license, onViewDetails, onCarryForward, onBlock, onUnblock }) => {
  return (
    <div className="flex items-center gap-2">
      {/* View Details - Always visible */}
      <button
        onClick={() => onViewDetails(license)}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="View full details"
      >
        <Eye size={18} />
      </button>

      {/* Carry Forward - Only if has credits remaining */}
      {license.credit_left > 0 && license.status !== 'CF' && license.status !== 'R' && (
        <button
          onClick={() => onCarryForward(license)}
          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          title="Carry forward credits"
        >
          <ArrowRight size={18} />
        </button>
      )}

      {/* Block - Only if not already revoked */}
      {license.status !== 'R' && (
        <button
          onClick={() => onBlock(license)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Block/Revoke license"
        >
          <XCircle size={18} />
        </button>
      )}

      {/* Unblock - Only if revoked */}
      {license.status === 'R' && (
        <button
          onClick={() => onUnblock(license)}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
          title="Unblock license"
        >
          <CheckCircle size={18} />
        </button>
      )}
    </div>
  );
};

export default LicenseActionButtons;
