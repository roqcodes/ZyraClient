import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import Install from './pages/Install';

// Components
import Layout from './components/Layout';
import ChatWidget from './components/ChatWidget';

// Contexts
import { ShopProvider, useShop } from './contexts/ShopContext';
import { ChatProvider } from './contexts/ChatContext';

// Auth guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useShop();
  const location = useLocation();
  
  // If still loading, show nothing yet
  if (isLoading) return null;
  
  // If not authenticated, redirect to install page
  if (!isAuthenticated) {
    return <Navigate to="/install" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// App wrapper with providers
function AppWrapper() {
  return (
    <Router>
      <ShopProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </ShopProvider>
    </Router>
  );
}

// Main app with routes
function AppRoutes() {
  const { isAuthenticated } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for shop parameter in URL and handle redirection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    
    console.log('Current path:', location.pathname);
    console.log('Shop param:', shop);
    console.log('Is authenticated:', isAuthenticated);
    
    // If shop parameter exists and we're on the root path, store it and redirect
    if (shop) {
      console.log('Shop parameter found, storing in localStorage');
      localStorage.setItem('shopDomain', shop);
      
      // Force redirect to dashboard if we have a shop parameter (likely coming from OAuth)
      if (location.pathname === '/') {
        console.log('Redirecting to dashboard after OAuth');
        navigate('/dashboard', { replace: true });
        return;
      }
    }
    
    // Special case for root path without shop parameter
    if (location.pathname === '/' && !shop) {
      const storedShop = localStorage.getItem('shopDomain');
      if (storedShop) {
        console.log('No shop in URL but found in localStorage, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location, isAuthenticated, navigate]);
  
  return (
    <>
      <Routes>
        {/* Home route - redirect based on auth status */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/install" replace />
          } 
        />
        
        {/* Install page */}
        <Route path="/install" element={<Install />} />
        
        {/* Protected dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Auth callback route */}
        <Route path="/auth/callback" element={<div>Processing authentication...</div>} />
        
        {/* 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Chat widget - show on authenticated routes and when embedded in Shopify */}
      {isAuthenticated && (location.pathname !== '/dashboard' || window.self !== window.top) && <ChatWidget />}
    </>
  );
}

function App() {
  return <AppWrapper />;
}

export default App;
