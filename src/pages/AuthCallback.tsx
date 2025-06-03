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

    const verifyAuth = async () => {
      try {
        // Verify the OAuth callback with the backend
        const response = await axios.get(`${API_BASE_URL}/auth/callback`, {
          params: { code, shop, hmac, state },
          withCredentials: true,
        });

        // If verification is successful, redirect to the dashboard
        if (response.data.success) {
          // Store the shop domain in localStorage for future use
          if (shop) {
            localStorage.setItem('shopDomain', shop);
          }
          navigate('/dashboard');
        } else {
          throw new Error(response.data.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Error during authentication:', error);
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
