import React, { useState } from 'react';
import { X, Copy, Check, CheckCircle2 } from 'lucide-react';

const CarryForwardSuccessModal = ({ isOpen, data, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(data.new_license_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-600" size={22} />
            <h2 className="text-xl font-semibold text-gray-900">New License Generated</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-green-700 font-medium mb-1">New License Key</p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-lg text-green-800 break-all">
                {data.new_license_key}
              </span>
              <button
                onClick={copyKey}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-white border border-green-300 rounded hover:bg-green-100"
                title="Copy"
              >
                {copied
                  ? <><Check size={14} /> Copied</>
                  : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Credits:</span>
              <span className="font-semibold text-gray-900">{data.credits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Validity:</span>
              <span className="text-gray-900">{data.validity_days} days</span>
            </div>
            {data.end_date && (
              <div className="flex justify-between">
                <span className="text-gray-500">Expires on:</span>
                <span className="text-gray-900">{String(data.end_date).split('T')[0]}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-500">Carried forward from:</span>
              <span className="font-mono text-gray-700">{data.source_license_key}</span>
            </div>
          </div>

          <button onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarryForwardSuccessModal;
