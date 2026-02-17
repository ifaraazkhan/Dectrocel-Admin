import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import { LogOut, User, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { selectedProduct, setSelectedProduct } = useProduct();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Product Tabs (X-ray/CT) */}
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

        {/* Right Side - User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>
              <span className="text-sm font-medium">{user?.username || 'Admin'}</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Role: {user?.role || 'Administrator'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
