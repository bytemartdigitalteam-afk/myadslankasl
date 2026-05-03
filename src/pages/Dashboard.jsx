import { useState, useEffect, useContext } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = '/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${user?.token}` },
    timeout: 15000,
  };

  useEffect(() => {
    fetchMyAds();
  }, []);

  const fetchMyAds = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/ads/myads`, axiosConfig);
      setMyAds(res.data);
    } catch (err) {
      console.error('Failed to fetch ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      await axios.delete(`${API_URL}/ads/${adId}`, axiosConfig);
      setMyAds(prev => prev.filter(ad => ad._id !== adId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete ad');
    }
  };

  const handleStockChange = async (adId, newStatus) => {
    try {
      await axios.put(`${API_URL}/ads/${adId}/stock`, { stockStatus: newStatus }, axiosConfig);
      setMyAds(prev => prev.map(ad => ad._id === adId ? { ...ad, stockStatus: newStatus } : ad));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock status');
    }
  };

  const activeAds = myAds.filter(ad => ad.status === 'approved').length;
  const pendingAds = myAds.filter(ad => ad.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          My Dashboard 
          {user?.isVerified && <span className="text-green-500 text-xl" title="Verified">✅</span>}
        </h1>
        <div className="flex gap-3">
          <Link to="/verify-account" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center gap-2 text-sm">
            Verify Account
          </Link>
          <Link to="/post-product" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center gap-2 text-sm">
            <Plus size={16} />
            Post a Product Ad
          </Link>
          <Link to="/post-ad" className="bg-brand-magenta hover:bg-pink-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center gap-2 text-sm">
            <Plus size={16} />
            Post New Ad
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow border border-gray-200 dark:border-dark-700 border-l-4 border-l-green-500">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Active Ads</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{activeAds}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow border border-gray-200 dark:border-dark-700 border-l-4 border-l-yellow-500">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Pending Review</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{pendingAds}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow border border-gray-200 dark:border-dark-700 border-l-4 border-l-blue-500">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Ads</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{myAds.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Ads</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-magenta border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Ad Title</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myAds.map((ad) => (
                  <tr key={ad._id} className="border-b border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{ad.title}</td>
                    <td className="p-4 text-brand-magenta font-semibold">Rs {Number(ad.price).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ad.status === 'approved' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                        ad.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{ad.category}</td>
                    <td className="p-4 flex items-center justify-end gap-3">
                      {ad.adType === 'product' && (
                        <select 
                          value={ad.stockStatus || 'in-stock'} 
                          onChange={(e) => handleStockChange(ad._id, e.target.value)}
                          className={`text-xs font-bold py-1 px-2 rounded outline-none border ${
                            (ad.stockStatus || 'in-stock') === 'in-stock' 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800' 
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:border-red-800'
                          }`}
                        >
                          <option value="in-stock">In Stock</option>
                          <option value="sold-out">Sold Out</option>
                        </select>
                      )}
                      <button
                        onClick={() => handleDelete(ad._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {myAds.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                      You haven't posted any ads yet.
                      <Link to="/post-ad" className="text-brand-magenta hover:underline ml-2">Post your first ad!</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
