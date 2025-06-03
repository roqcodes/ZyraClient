import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Define types
interface ShopData {
  shop_domain: string;
  installed_at: string;
  metadata?: Record<string, any>;
}

interface ShopContextType {
  shop: ShopData | null;
  setShop: (shopDomain: string) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  logout: () => void;
}

// Create context
const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Provider component
export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if shop is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get shop from URL query parameter or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const shopDomain = urlParams.get('shop') || localStorage.getItem('shopDomain');
        
        if (!shopDomain) {
          setIsLoading(false);
          return;
        }
        
        const fetchShopData = async (shopDomain: string) => {
          try {
            setIsLoading(true);
            setError(null);
            
            console.log(`Fetching shop data for ${shopDomain}`);
            
            // Always use the absolute backend URL to avoid routing issues
            const backendUrl = 'https://primate-perfect-haddock.ngrok-free.app';
            
            // Use axios instead of fetch for better error handling and CORS support
            const axios = (await import('axios')).default;
            const { data } = await axios.get(`${backendUrl}/api/shop`, {
              params: { shop: shopDomain },
              withCredentials: true, // Important for cookies
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            // Data comes directly from axios
            console.log('Shop data:', data);
            
            // Store shop data and authentication state
            setShop(data);
            
            // Persist shop domain in localStorage with timestamp for expiry checking
            localStorage.setItem('shopDomain', shopDomain);
            localStorage.setItem('shopAuthTime', Date.now().toString());
            
            return data;
          } catch (err: any) {
            console.error('Error fetching shop data:', err);
            setError(err.message);
            
            // FALLBACK: If we have a shop domain but API fails, create a minimal shop object
            // This ensures the user stays authenticated even if API calls fail
            if (shopDomain) {
              console.log('Using fallback authentication with shop domain:', shopDomain);
              const fallbackShop = {
                shop_domain: shopDomain,
                installed_at: new Date().toISOString()
              };
              setShop(fallbackShop);
              return fallbackShop;
            } else {
              setShop(null);
              return null;
            }
          } finally {
            setIsLoading(false);
          }
        };
        
        await fetchShopData(shopDomain);
      } catch (err: any) {
        console.error('Auth check failed:', err);
        
        // Handle redirect to install
        if (err.response?.data?.redirectUrl) {
          window.location.href = err.response.data.redirectUrl;
          return;
        }
        
        setError('Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Logout function
  const logout = () => {
    setShop(null);
    // Clear any cookies or local storage if needed
    navigate('/?logout=true');
  };

  // Function to manually set shop domain and update state
  const setShopDomain = (shopDomain: string) => {
    if (!shopDomain) return;
    
    console.log(`Manually setting shop domain: ${shopDomain}`);
    localStorage.setItem('shopDomain', shopDomain);
    
    // Create a minimal shop data object
    const shopData: ShopData = {
      shop_domain: shopDomain,
      installed_at: new Date().toISOString()
    };
    
    setShop(shopData);
  };

  return (
    <ShopContext.Provider
      value={{
        shop,
        setShop: setShopDomain,
        isLoading,
        isAuthenticated: !!shop,
        error,
        logout
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// Hook for using the shop context
export function useShop() {
  const context = useContext(ShopContext);
  
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  
  return context;
}
