import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { shop, isAuthenticated, logout } = useShop();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">Shop Assistant</Link>
          
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{shop?.shop_domain}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Shop Assistant. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
