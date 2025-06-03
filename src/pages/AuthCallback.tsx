import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const hmac = searchParams.get('hmac');
    const state = searchParams.get('state');

    console.log('AuthCallback: Processing authentication callback');
    console.log('Shop:', shop);
    console.log('Code:', code ? 'Present' : 'Missing');

    // Always ensure shop is stored in localStorage if available
    if (shop) {
      console.log('AuthCallback: Setting shop in localStorage');
      localStorage.setItem('shopDomain', shop);
    }

    const verifyAuth = async () => {
      try {
        // Log the API call we're about to make
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
          
          // Store the shop domain in localStorage for future use
          if (shop) {
            localStorage.setItem('shopDomain', shop);
          }
          
          // Force window location change instead of using React Router
          // This ensures a complete refresh and state reset
          // Use full URL path to ensure proper redirect without 404
          const baseUrl = window.location.origin;
          window.location.href = `${baseUrl}/dashboard`;
        } else {
          console.error('AuthCallback: Authentication unsuccessful', response.data);
          throw new Error(response.data.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('AuthCallback: Error during authentication:', error);
        navigate('/error', { 
          state: { 
            error: 'Failed to authenticate with Shopify',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
          } 
        });
      }
    };

    verifyAuth();
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700">Completing authentication...</p>
      </div>
    </div>
  );
}
