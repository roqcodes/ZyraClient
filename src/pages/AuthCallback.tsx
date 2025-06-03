import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Define an async function for the auth flow
    const processAuthCallback = async () => {
      try {
        setIsLoading(true);
        const code = searchParams.get('code');
        const shop = searchParams.get('shop');
        const hmac = searchParams.get('hmac');
        const state = searchParams.get('state');

        console.log('AuthCallback: Processing authentication callback');
        console.log('Shop:', shop);
        console.log('Code:', code ? 'Present' : 'Missing');
        console.log('Current URL:', window.location.href);

        // Validate required parameters
        if (!shop) {
          throw new Error('Missing shop parameter');
        }

        if (!code) {
          throw new Error('Missing code parameter');
        }

        // Always ensure shop is stored in localStorage immediately
        console.log('AuthCallback: Setting shop in localStorage');
        localStorage.setItem('shopDomain', shop);
        
        // Try the API verification call
        console.log(`AuthCallback: Calling API at ${API_BASE_URL}/auth/callback`);
        
        // Verify the OAuth callback with the backend
        const response = await axios.get(`${API_BASE_URL}/auth/callback`, {
          params: { code, shop, hmac, state },
          withCredentials: true,
        });

        console.log('AuthCallback: Got response', response.data);

        // If verification is successful, redirect to the dashboard
        if (response.data.success) {
          console.log('AuthCallback: Authentication successful, redirecting to dashboard');
          
          // Redundantly ensure shop domain is in localStorage
          localStorage.setItem('shopDomain', shop);
          
          // Create the full URL to avoid any path issues
          const baseUrl = window.location.origin;
          const dashboardUrl = new URL('/dashboard', baseUrl);
          
          // Add shop parameter to ensure it's available after redirect
          dashboardUrl.searchParams.append('shop', shop);
          
          console.log('Redirecting to:', dashboardUrl.toString());
          
          // Use timeout to ensure localStorage is written before redirect
          setTimeout(() => {
            // Force full page reload to reset app state
            window.location.href = dashboardUrl.toString();
          }, 100);
        } else {
          console.error('AuthCallback: Authentication unsuccessful', response.data);
          throw new Error(response.data.error || 'Authentication failed');
        }
      } catch (err) {
        console.error('AuthCallback: Error during authentication:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
        
        // Manual redirect to error page with full URL
        const baseUrl = window.location.origin;
        const errorUrl = new URL('/error', baseUrl);
        errorUrl.searchParams.append('message', 'Failed to authenticate with Shopify');
        
        // Use timeout to ensure state is updated first
        setTimeout(() => {
          window.location.href = errorUrl.toString();
        }, 100);
      }
    };

    // Execute the auth flow
    processAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
            <p className="text-gray-700">Please wait while we complete the authentication process...</p>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = `${window.location.origin}/install`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Return to Install Page
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
