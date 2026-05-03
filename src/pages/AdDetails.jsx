import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Clock, ThumbsUp, Eye, BadgeCheck, 
  Crown, Star, Search, Heart, Share2, Phone, MessageCircle 
} from 'lucide-react';

const API_URL = '/api';

const AdDetails = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchAd();
    fetchCategories();
  }, [id]);

  const fetchAd = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/ads/${id}`, { timeout: 15000 });
      setAd(res.data);
    } catch (err) {
      console.error('Failed to fetch ad:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/categories`, { timeout: 10000 });
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getLevelEmoji = (level) => {
    if (level === 'vvip' || level === 'vip') return '👑';
    if (level === 'verified') return '✅';
    return '📌';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-magenta border-t-transparent"></div>
      </div>
    );
  }

  if (!ad) {
    return <div className="text-center py-20 text-gray-500">Ad not found.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
        {/* Red Search/Post Box */}
        <div className="bg-brand-red text-white p-4 rounded-lg text-center shadow-lg">
          <h3 className="font-bold text-lg">How to publish Ads?</h3>
          <p className="text-sm font-light mb-4">දැන්වීමක් දමන්නේ කෙසේද?</p>
          <Link to="/post-ad" className="inline-block bg-white text-brand-red font-bold py-2 px-6 rounded hover:bg-gray-100 transition-colors text-sm">
            Post Your Ad
          </Link>
        </div>

        {/* Search */}
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); window.location.href = `/?keyword=${searchKeyword}`; }}>
          <input
            type="text"
            placeholder="Search Ads ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-magenta"
          />
          <button type="submit" className="bg-gray-900 dark:bg-brand-magenta text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity">
            <Search size={16} />
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Link to="/agents" className="bg-pink-600 text-white py-2 rounded font-medium shadow flex justify-center items-center gap-2 hover:bg-pink-700 transition-colors"><BadgeCheck size={16} /> Agents</Link>
          <button className="bg-yellow-400 text-gray-900 py-2 rounded font-bold shadow flex justify-center items-center gap-2 hover:bg-yellow-500 transition-colors"><Crown size={16} /> Premium</button>
          <button className="bg-gray-900 text-white py-2 rounded font-medium shadow flex justify-center items-center gap-2 hover:bg-gray-800 transition-colors"><Star size={16} /> Fake Ads</button>
          <button className="bg-red-700 text-white py-2 rounded font-medium shadow flex justify-center items-center gap-2 hover:bg-red-800 transition-colors">My Saved Ads</button>
          <button className="bg-cyan-600 text-white py-2 rounded font-medium shadow flex justify-center items-center gap-2 hover:bg-cyan-700 transition-colors">Blog</button>
          <Link to="/login" className="bg-gray-900 text-white py-2 rounded font-medium shadow flex justify-center items-center gap-2 text-center hover:bg-gray-800 transition-colors">Login</Link>
        </div>

        {/* Categories List */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 border border-gray-200 dark:border-dark-700 mt-2">
          <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Top Categories</h2>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-magenta cursor-pointer text-sm font-medium transition-colors">
                <Crown size={14} className="text-brand-red" />
                <Link to={`/?category=${cat.name}`}>{cat.name}</Link>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="text-sm text-gray-400">No categories added yet.</li>
            )}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Yellow Banner */}
        <div className="bg-gradient-to-b from-yellow-300 to-amber-500 rounded-lg shadow-md text-center p-4 mb-6 text-gray-900 border border-yellow-400">
          <h2 className="text-lg font-bold">නවතම ඇඩ්ස් සඳහා මෙතන ඔබන්න</h2>
          <p className="font-bold text-sm">Click here to see new ads</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700 p-6">
          
          {/* Main Image */}
          <div className="w-full flex justify-center mb-6 bg-gray-100 dark:bg-dark-900 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-700 relative" style={{ maxHeight: '500px' }}>
            
            {ad.adType === 'product' && ad.stockStatus === 'sold-out' && (
              <div className="absolute inset-0 bg-white/40 dark:bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-red-600 text-white font-black py-3 px-8 rounded-lg transform -rotate-12 border-4 border-white shadow-2xl text-4xl tracking-widest">
                  SOLD OUT
                </div>
              </div>
            )}

            {ad.images && ad.images.length > 0 ? (
              <img src={`/${ad.images[0]}`} alt={ad.title} className="object-contain w-full h-full" style={{ maxHeight: '500px' }} />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-gray-400">
                <span className="text-4xl">📷 No Image Available</span>
              </div>
            )}
          </div>

          {/* Ad Title & Meta */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              {getLevelEmoji(ad.level)} {ad.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1">Location: {ad.location}</span>
              <span>•</span>
              <span>{ad.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {ad.views || 0} Views</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {timeAgo(ad.createdAt)}</span>
            </div>
          </div>

          {/* Action Buttons: Like, Save, Share */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button className="bg-[#111827] text-white py-2 rounded flex justify-center items-center gap-2 font-medium hover:bg-gray-800 transition-colors">
              <ThumbsUp size={16} /> Like
            </button>
            <button className="bg-[#111827] text-white py-2 rounded flex justify-center items-center gap-2 font-medium hover:bg-gray-800 transition-colors">
              <Heart size={16} /> Save
            </button>
            <button className="bg-[#111827] text-white py-2 rounded flex justify-center items-center gap-2 font-medium hover:bg-gray-800 transition-colors">
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Price and Likes summary */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-dark-700 pb-4">
            <span className="text-brand-red font-bold text-xl">Rs. {Number(ad.price).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm font-medium">
              <ThumbsUp size={14} /> {ad.likes || 0} Likes
            </span>
          </div>

          {/* Contact Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            <a href={`tel:${ad.contactNumber}`} className="w-full border-2 border-brand-red text-brand-red font-bold py-3 rounded text-center flex justify-center items-center gap-2 hover:bg-red-50 transition-colors">
              <Phone size={18} /> Call {ad.contactNumber || 'Not Available'}
            </a>
            <a href={`https://wa.me/${ad.contactNumber?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full border-2 border-green-500 text-green-600 font-bold py-3 rounded text-center flex justify-center items-center gap-2 hover:bg-green-50 transition-colors">
              <MessageCircle size={18} /> {ad.contactNumber || 'Not Available'}
            </a>
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {ad.description}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdDetails;
