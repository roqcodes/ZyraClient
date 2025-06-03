import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get parameters from URL
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const hmac = searchParams.get('hmac');
    const state = searchParams.get('state');

    console.log('Auth callback processing');
    console.log('Shop:', shop);
    
    // Save shop to localStorage immediately
    if (shop) {
      console.log('Saving shop to localStorage:', shop);
      localStorage.setItem('shopDomain', shop);
    }
    
    // Basic verification with backend
    const verifyAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/callback`, {
          params: { code, shop, hmac, state },
          withCredentials: true,
        });
        
        console.log('Auth response:', response.data);
        
        if (response.data.success) {
          // Hard redirect to dashboard with full URL
          window.location.href = window.location.origin + '/dashboard';
        } else {
          // Hard redirect to error page
          window.location.href = window.location.origin + '/error';
        }
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = window.location.origin + '/error';
      }
    };
    
    verifyAuth();
  }, [searchParams]);

  // Simple loading indicator
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Authenticating...</p>
      </div>
    </div>
  );
}
