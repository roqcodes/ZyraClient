import { useShop } from '../contexts/ShopContext';
import Chat from '../components/Chat';

const Dashboard = () => {
  const { shop, isLoading, error } = useShop();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
            <p>Shop not found. Please install the app in your Shopify store.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Show error as warning banner if present */}
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">API Warning</p>
          <p>There was an issue connecting to the API, but you can still use the dashboard: {error}</p>
        </div>
      )}
      
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Shop Assistant Dashboard</h1>
        <p className="text-gray-600">Manage your AI shop assistant for {shop?.shop_domain || localStorage.getItem('shopDomain')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shop Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Shop Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Shop Domain</p>
              <p className="font-medium">{shop.shop_domain}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Installed At</p>
              <p className="font-medium">{shop.installed_at ? new Date(shop.installed_at).toLocaleString() : 'Recently'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Assistant Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assistant Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assistant Name
              </label>
              <input
                type="text"
                defaultValue="Shop Assistant"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personality
              </label>
              <select
                defaultValue="standard"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Enable on all store pages</span>
              </label>
            </div>
            <button
              type="button"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Test Assistant */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-96">
          <h2 className="text-xl font-semibold mb-4">Test Assistant</h2>
          <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
