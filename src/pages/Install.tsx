import { useState } from 'react';

const Install = () => {
  const [shopDomain, setShopDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopDomain) {
      setError('Please enter your shop domain');
      return;
    }
    
    // Format the shop domain
    let formattedDomain = shopDomain.trim().toLowerCase();
    
    // Remove https:// or http:// if present
    formattedDomain = formattedDomain.replace(/^https?:\/\//, '');
    
    // Remove trailing slash if present
    formattedDomain = formattedDomain.replace(/\/$/, '');
    
    // Add .myshopify.com if not present and doesn't contain a dot
    if (!formattedDomain.includes('.')) {
      formattedDomain = `${formattedDomain}.myshopify.com`;
    }
    
    setIsLoading(true);
    
    try {
      // Get the backend URL from environment or use default
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';
      
      // Redirect to the auth endpoint (matches the updated OAuth flow in server.js)
      window.location.href = `${backendUrl}/auth?shop=${formattedDomain}`;
    } catch (error) {
      console.error('Installation error:', error);
      setError('Failed to start installation process');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Shop Assistant</h1>
          <p className="mt-2 text-gray-600">
            Install the AI shop assistant on your Shopify store
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="shop-domain" className="block text-sm font-medium text-gray-700">
              Shop Domain
            </label>
            <div className="mt-1">
              <input
                id="shop-domain"
                name="shop"
                type="text"
                required
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="yourshop.myshopify.com"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter your Shopify store domain to install the app
            </p>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Installing...
                </>
              ) : (
                'Install App'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Install;
