import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import Chat from '../components/Chat';

const ChatPage = () => {
  const location = useLocation();
  const { shop } = useShop();
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're embedded in an iframe
    const params = new URLSearchParams(location.search);
    const embedded = params.get('embedded') === 'true';
    const shopParam = params.get('shop');
    
    setIsEmbedded(embedded);
    
    // If we're embedded, notify the parent window that we're ready
    if (embedded) {
      try {
        window.parent.postMessage({ 
          type: 'WIDGET_READY',
          height: document.documentElement.scrollHeight
        }, '*');
      } catch (e) {
        console.error('Failed to send WIDGET_READY message:', e);
      }
    }
    
    // If we have a shop parameter but no shop in context, set it
    if (shopParam && !shop) {
      localStorage.setItem('shopDomain', shopParam);
      window.location.href = `/?shop=${shopParam}`;
      return;
    }
    
    setIsLoading(false);
    
    // Handle window resize events to update the parent iframe height
    const handleResize = () => {
      if (embedded) {
        window.parent.postMessage({
          type: 'WIDGET_RESIZE',
          height: document.documentElement.scrollHeight
        }, '*');
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [location.search, shop]);
  
  // Handle messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'WIDGET_OPENED') {
        // Handle widget opened event
        console.log('Widget opened');
      } else if (event.data.type === 'WIDGET_CLOSED') {
        // Handle widget closed event
        console.log('Widget closed');
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Shop Not Found</h2>
          <p className="text-yellow-600">Please open the chat from your Shopify store.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${isEmbedded ? 'h-full' : 'min-h-screen'} bg-white`}>
      <Chat embedded={isEmbedded} />
    </div>
  );
};

export default ChatPage;
