import React from 'react';
import { useProduct } from '../../context/ProductContext';

const ProductSwitcher = () => {
  const { selectedProduct, setSelectedProduct } = useProduct();

  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setSelectedProduct('xray')}
        className={`px-6 py-2 rounded-md font-medium transition-all ${
          selectedProduct === 'xray'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        X-ray
      </button>
      <button
        onClick={() => setSelectedProduct('ct')}
        className={`px-6 py-2 rounded-md font-medium transition-all ${
          selectedProduct === 'ct'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        CT
      </button>
    </div>
  );
};

export default ProductSwitcher;
