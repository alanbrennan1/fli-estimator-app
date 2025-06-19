import React, { useState } from 'react';

const OpenQuoteModal = ({ isOpen, onClose, onLoadQuote }) => {
  const [opportunityNumber, setOpportunityNumber] = useState('');

  const handleLoad = () => {
    onLoadQuote(opportunityNumber.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Open Quote</h2>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Number
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          value={opportunityNumber}
          onChange={(e) => setOpportunityNumber(e.target.value)}
          placeholder="Enter Project Number"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleLoad}
          >
            Load Quote
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenQuoteModal;
