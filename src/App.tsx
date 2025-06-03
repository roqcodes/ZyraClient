import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Install = lazy(() => import('./pages/Install'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback.tsx'));
const ErrorPage = lazy(() => import('./pages/ErrorPage.tsx'));

// Components
const Layout = lazy(() => import('./components/Layout'));
const ChatWidget = lazy(() => import('./components/ChatWidget'));

// Contexts
import { ShopProvider, useShop } from './contexts/ShopContext';
import { ChatProvider } from './contexts/ChatContext';

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Auth guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useShop();
  const location = useLocation();
  
  // If still loading, show loading spinner
  if (isLoading) return <Loading />;
  
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
      <Suspense fallback={<Loading />}>
        <ShopProvider>
          <ChatProvider>
            <AppRoutes />
          </ChatProvider>
        </ShopProvider>
      </Suspense>
    </Router>
  );
}

// Main app with routes
function AppRoutes() {
  const { isAuthenticated, setShop } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Global redirection logic that runs on every render
  useEffect(() => {
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const shopParam = searchParams.get('shop');
    const storedShop = localStorage.getItem('shopDomain');
    
    console.log('Current path:', currentPath);
    console.log('Shop param:', shopParam);
    console.log('Stored shop:', storedShop);
    console.log('Is authenticated:', isAuthenticated);
    
    // PRIORITY 1: Always save shop param to localStorage if available
    if (shopParam) {
      console.log('Shop parameter found, storing in localStorage');
      localStorage.setItem('shopDomain', shopParam);
      // Also update the context immediately
      setShop(shopParam);
    }
    
    // PRIORITY 2: Auth callback should be handled by the AuthCallback component
    if (currentPath === '/auth/callback') {
      console.log('On auth callback page, letting component handle it');
      return;
    }
    
    // PRIORITY 3: /chat and other special routes should not be redirected
    if (currentPath === '/chat' || currentPath === '/error') {
      console.log('On special route, not redirecting');
      return;
    }
    
    // PRIORITY 4: If shop exists in localStorage, always redirect to dashboard
    if (storedShop) {
      // But don't redirect if already on dashboard
      if (currentPath !== '/dashboard') {
        console.log('Shop found in localStorage, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
      return;
    }
    
    // PRIORITY 5: No shop in localStorage, redirect to install
    if (currentPath !== '/install') {
      console.log('No shop in localStorage, redirecting to install');
      navigate('/install', { replace: true });
    }
  }, [location.pathname, location.search, navigate, setShop, isAuthenticated]);
  
  return (
    <div className="min-h-screen bg-gray-50">
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
        <Route 
          path="/install" 
          element={
            <Suspense fallback={<Loading />}>
              <Install />
            </Suspense>
          } 
        />
        
        {/* Protected dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<Loading />}>
                <Layout>
                  <Dashboard />
                </Layout>
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
        {/* Chat route */}
        <Route 
          path="/chat" 
          element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>}>
              <ChatPage />
            </Suspense>
          } 
        />
        
        {/* Auth callback route */}
        <Route 
          path="/auth/callback" 
          element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Processing authentication...</p>
            </div>}>
              <AuthCallback />
            </Suspense>
          } 
        />
        
        {/* App route - handles both / and /app */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<Loading />}>
                <Layout>
                  <Dashboard />
                </Layout>
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
        {/* Error route */}
        <Route 
          path="/error" 
          element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>}>
              <ErrorPage />
            </Suspense>
          } 
        />
        
        {/* 404 route */}
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">Page not found</p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
      
      {/* Chat widget - show on authenticated routes and when embedded in Shopify */}
      {isAuthenticated && (location.pathname !== '/dashboard' || window.self !== window.top) && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
    </div>
  );
}

function App() {
  return <AppWrapper />;
}

export default App;
