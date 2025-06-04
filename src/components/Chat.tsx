import { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useShop } from '../contexts/ShopContext';

interface ChatProps {
  embedded?: boolean;
}

// Animation keyframes for message appearance
const fadeInAnimation = `@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}`;

const typing = `@keyframes typing {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}`;

const shimmer = `@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}`;

const Chat: React.FC<ChatProps> = ({ embedded = false }) => {
  const { messages, isLoading, products, sendMessage } = useChat();
  const { shop } = useShop();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shopDomain = shop?.shop_domain || localStorage.getItem('shopDomain');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Monitor scroll position to show/hide scroll to bottom button
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollToBottom(isScrolledUp);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput('');
    setTimeout(scrollToBottom, 100); // Ensure scroll happens after render
  };

  // Log shop domain for debugging
  useEffect(() => {
    console.log('Chat component initialized with shop domain:', shopDomain);
  }, [shopDomain]);
  
  return (
    <div className="flex flex-col h-full relative overflow-hidden rounded-lg shadow-2xl">
      {/* Add styling elements for gradient acrylic background */}
      <style>
        {`
          ${fadeInAnimation}
          ${typing}
          ${shimmer}
          
          .acrylic-bg {
            backdrop-filter: blur(10px);
            background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .chat-gradient {
            background: linear-gradient(120deg, #f0f9ff, #e1f5fe);
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
          }
          
          .message-bubble {
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            animation: fadeIn 0.3s ease forwards;
            transition: all 0.2s ease;
          }
          
          .message-bubble:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          }
          
          .user-bubble {
            background: linear-gradient(120deg, #4776E6, #8E54E9);
            color: white;
          }
          
          .assistant-bubble {
            background: white;
            color: #333;
          }
          
          .typing-indicator span {
            animation: typing 1.4s infinite;
          }
          
          .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
          }
          
          .product-card {
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          }
          
          .scroll-button {
            transition: opacity 0.3s, transform 0.3s;
          }
          
          .scroll-button:hover {
            transform: translateY(-2px);
          }
          
          .shimmer-effect {
            background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
            background-size: 800px 104px;
            animation: shimmer 1.5s infinite linear;
          }
        `}
      </style>
      
      {/* Background gradient effect */}
      <div className="chat-gradient"></div>
      
      {/* Header with shop name or title */}
      <div className="px-4 py-3 border-b acrylic-bg z-10 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold mr-2">
            S
          </div>
          <h2 className="font-medium text-gray-800">Shop Assistant</h2>
        </div>
        {shopDomain && 
          <div className="text-xs text-gray-500 italic">
            {shopDomain.replace('.myshopify.com', '')}
          </div>
        }
      </div>
      
      {/* Chat messages */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${embedded ? 'max-h-[calc(100vh-130px)]' : ''}`}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 my-8 space-y-4 opacity-80">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium mb-1">Start a conversation</p>
              <p className="text-sm">Ask about products, shipping, or anything else!</p>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 message-bubble ${
                message.sender_type === 'user' 
                  ? 'user-bubble rounded-tr-none' 
                  : 'assistant-bubble rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        
        {/* Products display with enhanced styling */}
        {products.length > 0 && (
          <div className="my-4 p-4 bg-white bg-opacity-80 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Products You Might Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-lg overflow-hidden product-card bg-white shadow-md">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 shimmer-effect" />
                  )}
                  <div className="p-3">
                    <h4 className="font-medium text-gray-800 line-clamp-1">{product.title}</h4>
                    <p className="text-blue-600 font-bold">{product.price}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    <a 
                      href={`/products/${product.handle}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-white bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                    >
                      View Product
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Enhanced typing indicator */}
        {isLoading && (
          <div className="flex justify-start" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white text-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%] shadow-md message-bubble">
              <div className="typing-indicator flex space-x-2 items-center px-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="w-2 h-2 rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button 
          onClick={scrollToBottom} 
          className="scroll-button absolute bottom-20 right-4 bg-white rounded-full p-2 shadow-lg opacity-80 hover:opacity-100 z-10 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
      
      {/* Enhanced input form */}
      <form onSubmit={handleSubmit} className="p-3 acrylic-bg border-t z-10">
        <div className="flex items-center space-x-2 bg-white p-1 rounded-full shadow-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 focus:outline-none rounded-full text-gray-800"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center focus:outline-none disabled:opacity-50 transition-all hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
