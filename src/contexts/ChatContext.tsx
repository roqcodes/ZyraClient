import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useShop } from './ShopContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types
interface Message {
  id?: string;
  sender_type: 'user' | 'assistant';
  text: string;
  timestamp?: string;
  read?: boolean;
}

interface Product {
  id: string;
  title: string;
  price: string;
  image_url: string;
  description: string;
  handle: string;
  tags?: string[];
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sessionId: string | null;
  products: Product[];
  shopDomain: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentShopDomain, setCurrentShopDomain] = useState<string | null>(null);
  const { shop } = useShop();
  
  // Update currentShopDomain when shop changes
  useEffect(() => {
    // Get shop domain from shop context, local storage, or URL params
    const getShopDomain = () => {
      // First try from shop context
      if (shop?.shop_domain) {
        console.log('Using shop domain from context:', shop.shop_domain);
        return shop.shop_domain;
      }

      // Then try from localStorage
      const storedShop = localStorage.getItem('shopDomain');
      if (storedShop) {
        console.log('Using shop domain from localStorage:', storedShop);
        return storedShop;
      }

      // Finally try from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const shopParam = urlParams.get('shop');
      if (shopParam) {
        console.log('Using shop domain from URL parameters:', shopParam);
        return shopParam;
      }

      return null;
    };

    const shopDomain = getShopDomain();
    if (shopDomain && shopDomain !== currentShopDomain) {
      console.log('Setting shop domain:', shopDomain);
      setCurrentShopDomain(shopDomain);
    }
  }, [shop, currentShopDomain]);

  // Load chat session history if sessionId exists
  useEffect(() => {
    if (sessionId) {
      loadChatSessionHistory(sessionId);
    }
  }, [sessionId]);

  // Load chat session history from Supabase
  const loadChatSessionHistory = async (chatSessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', chatSessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedMessages = data.map((msg) => {
          return {
            id: msg.id,
            sender_type: msg.sender_type,
            text: msg.text,
            timestamp: msg.created_at,
            read: msg.read
          };
        });

        setMessages(formattedMessages);
        
        // Mark messages as read
        markMessagesAsRead(chatSessionId);
      }
    } catch (error) {
      console.error('Error loading chat session history:', error);
    }
  };
  
  // Mark messages as read
  const markMessagesAsRead = async (chatSessionId: string) => {
    try {
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('session_id', chatSessionId)
        .eq('sender_type', 'assistant')
        .eq('read', false);
        
      await supabase
        .from('chat_sessions')
        .update({ has_unread_messages: false })
        .eq('id', chatSessionId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Save message to Supabase
  const saveMessageToSupabase = async (message: Message, sessionId: string | null) => {
    if (!sessionId) return;
    
    try {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        sender_type: message.sender_type,
        text: message.text,
        read: message.read || false
      });
    } catch (error) {
      console.error('Error saving message to Supabase:', error);
      // Continue even if saving fails - session storage is non-critical
    }
  };

  // Send message to API
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to state
    const userMessage: Message = {
      sender_type: 'user',
      text: message,
      timestamp: new Date().toISOString(),
      read: true
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Save user message to Supabase if we have a session ID
    if (sessionId) {
      saveMessageToSupabase(userMessage, sessionId);
    }

    try {
      // Ensure we have a valid shop domain 
      if (!currentShopDomain) {
        console.error('No shop domain available. Trying fallbacks before failing.');
        
        // Try to get shop domain from localStorage as last resort
        const storedShop = localStorage.getItem('shopDomain');
        if (storedShop) {
          console.log('Using shop domain from localStorage as fallback:', storedShop);
          setCurrentShopDomain(storedShop);
        } else {
          console.error('No shop domain available even after fallbacks. Cannot send message.');
          setIsLoading(false);
          
          // Add error message
          setMessages(prev => [...prev, {
            sender_type: 'assistant',
            text: 'Sorry, there was an error connecting to your shop. Please refresh the page and try again.',
            timestamp: new Date().toISOString(),
            read: true
          }]);
          return;
        }
      }
    
    const customerInfo = { id: 'customer-' + Math.random().toString(36).substring(2, 9) }; // Simple customer info
    
    // Set query parameters
    const params = new URLSearchParams();
    params.append('shop', currentShopDomain || '');
    const queryString = params.toString();
    
    console.log('Sending message with shop domain:', currentShopDomain);
      
      // Get the backend URL from environment variables or use default
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';
      console.log('Using backend URL:', backendUrl);
      
      // Ensure we use HTTPS in production environments
      let apiUrl = backendUrl;
      if (window.location.protocol === 'https:' && apiUrl.startsWith('http:')) {
        apiUrl = apiUrl.replace('http:', 'https:');
        console.log('Switched to HTTPS for API calls:', apiUrl);
      }
      
      const eventSource = new EventSource(`${apiUrl}/api/chat?${queryString}`, {
        withCredentials: true
      });
      
      // Send the message via fetch to initiate the stream
      fetch(`${apiUrl}/api/chat?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          message,
          sessionId,
          shopDomain: currentShopDomain,
          customerInfo
        })
      }).catch(error => {
        console.error('Error sending chat message:', error);
        setIsLoading(false);
        setMessages(prev => [...prev, {
          sender_type: 'assistant',
          text: 'Sorry, there was an error connecting to the chat service. Please try again later.',
          timestamp: new Date().toISOString(),
          read: true
        }]);
        eventSource.close();
      });

      let assistantResponse = '';

      // Handle SSE events
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'text':
              assistantResponse += data.text;
              setMessages((prev) => {
                const newMessages = [...prev];
                // Update or add assistant message
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.sender_type === 'assistant') {
                  lastMessage.text = assistantResponse;
                } else {
                  newMessages.push({
                    sender_type: 'assistant',
                    text: assistantResponse,
                    timestamp: new Date().toISOString(),
                    read: false
                  });
                }
                return newMessages;
              });
              break;
              
            case 'products':
              if (Array.isArray(data.products) && data.products.length > 0) {
                console.log(`Received ${data.products.length} products from API`);
                setProducts(data.products);
              }
              break;
              
            case 'session_id':
              if (data.sessionId && !sessionId) {
                console.log('Setting new session ID:', data.sessionId);
                setSessionId(data.sessionId);
              }
              break;
              
            case 'auth_required':
              console.warn('Authentication required for tool:', data.tool || 'unknown');
              eventSource.close();
              setIsLoading(false);
              setMessages(prev => [...prev, {
                sender_type: 'assistant',
                text: 'Authentication required to access shop data. Please login to your shop account.',
                timestamp: new Date().toISOString(),
                read: true
              }]);
              break;
              
            case 'done':
              // Save the final assistant message to Supabase
              if (assistantResponse && sessionId) {
                const assistantMessage = {
                  sender_type: 'assistant' as const,
                  text: assistantResponse,
                  timestamp: new Date().toISOString(),
                  read: true
                };
                saveMessageToSupabase(assistantMessage, sessionId);
              }
              eventSource.close();
              setIsLoading(false);
              break;
              
            case 'error':
              console.error('Error from API:', data.error);
              eventSource.close();
              setIsLoading(false);
              // Add error message for the user
              setMessages(prev => [...prev, {
                sender_type: 'assistant',
                text: `Sorry, there was an error: ${data.error || 'Unknown error'}. Please try again.`,
                timestamp: new Date().toISOString(),
                read: true
              }]);
              break;
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
    setProducts([]);
    setSessionId(null);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        sessionId,
        products,
        shopDomain: currentShopDomain,
        sendMessage,
        clearMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Hook for using the chat context
// Using a named constant export instead of a function declaration to fix Fast Refresh compatibility
export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};
