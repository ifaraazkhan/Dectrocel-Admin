import React from 'react';
import { useProduct } from '../../context/ProductContext';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const { selectedProduct } = useProduct();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - content changes based on selectedProduct */}
      <Sidebar product={selectedProduct} />

      <div className="flex-1 flex flex-col">
        {/* Header now contains Product Switcher (X-ray/CT tabs) on left and User menu on right */}
        <Header />

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
