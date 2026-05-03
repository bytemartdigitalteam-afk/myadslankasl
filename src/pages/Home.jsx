import { useState, useEffect } from 'react';
import { MapPin, Clock, ThumbsUp, Eye, BadgeCheck, Crown, Star, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

const Home = () => {
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialKeyword = searchParams.get('keyword') || '';

  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 8;

  useEffect(() => {
    fetchAds(initialKeyword, initialCategory);
    fetchCategories();
  }, [initialKeyword, initialCategory]);

  const fetchAds = async (keyword = '', category = '') => {
    try {
      setLoading(true);
      const params = {};
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      
      const res = await axios.get(`${API_URL}/ads`, { params, timeout: 15000 });
      setAds(res.data);
      setCurrentPage(1); // Reset page on new fetch
    } catch (err) {
      console.error('Failed to fetch ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchKeyword) prev.set('keyword', searchKeyword);
      else prev.delete('keyword');
      return prev;
    });
  };

  const handleCategoryClick = (categoryName) => {
    const newCategory = selectedCategory === categoryName ? '' : categoryName;
    setSelectedCategory(newCategory);
    
    setSearchParams(prev => {
      if (newCategory) prev.set('category', newCategory);
      else prev.delete('category');
      return prev;
    });
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/categories`, { timeout: 10000 });
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        console.error("Categories response is not an array:", res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const getLevelBadge = (ad) => {
    if (ad.level === 'vvip') return { text: 'VVIP Ad', bg: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900' };
    if (ad.level === 'vip' || ad.isVIP) return { text: 'VIP Ad', bg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' };
    if (ad.level === 'verified') return { text: 'Verified', bg: 'bg-green-500 text-white' };
    return null;
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

  // Pagination Logic
  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);
  const totalPages = Math.ceil(ads.length / adsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <form onSubmit={handleSearch} className="flex gap-2">
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
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 border border-gray-200 dark:border-dark-700">
          <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Top Categories</h2>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li 
                key={cat._id} 
                onClick={() => handleCategoryClick(cat.name)} 
                className={`flex items-center gap-2 cursor-pointer text-sm font-medium transition-colors ${
                  selectedCategory === cat.name ? 'text-brand-magenta' : 'text-gray-600 dark:text-gray-300 hover:text-brand-magenta'
                }`}
              >
                <Crown size={14} className={selectedCategory === cat.name ? 'text-brand-magenta' : 'text-brand-red'} />
                {cat.name}
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

        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-800 via-pink-600 to-brand-magenta rounded-lg shadow-lg text-white p-8 text-center mb-6">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Lanka Ads by My Ads Lanka</h1>
          <p className="text-xl font-medium">The #1 Lanka Ad Platform</p>
          <p className="text-sm mt-2 opacity-80">for Personal Ads in Sri Lanka</p>
        </div>

        {/* Top Action Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button className="bg-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-pink-700 transition-colors">Agents</button>
          <button className="bg-brand-red text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-red-700 transition-colors">Blog</button>
          <button className="bg-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-pink-700 transition-colors">Help Services</button>

          <div className="w-full h-0"></div>

          <button className="bg-yellow-400 text-gray-900 px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors"><Crown size={14} /> Premium</button>
          <button className="border border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-dark-800 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 hover:bg-cyan-50 dark:hover:bg-dark-700 transition-colors">Subscribe</button>
          <button className="bg-orange-600 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 hover:bg-orange-700 transition-colors">Browse Fake Ads</button>
        </div>

        {/* Loading / Empty / Ad Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-magenta border-t-transparent"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No ads found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Be the first to post an ad!</p>
            <Link to="/post-ad" className="inline-block mt-4 bg-brand-magenta text-white font-medium py-2 px-6 rounded hover:bg-pink-700 transition-colors">
              Post Ad Now
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAds.map((ad) => {
                const badge = getLevelBadge(ad);
              return (
                <Link to={`/ad/${ad._id}`} key={ad._id} className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700 relative flex flex-col hover:shadow-lg transition-shadow">

                  {/* Level Badge */}
                  {badge && (
                    <div className={`absolute top-0 right-0 ${badge.bg} text-[10px] font-bold px-2 py-0.5 rounded-bl z-10`}>
                      {badge.text}
                    </div>
                  )}
                  
                  {/* Sold Out Overlay */}
                  {ad.adType === 'product' && ad.stockStatus === 'sold-out' && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/50 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                      <div className="bg-red-600 text-white font-bold py-1 px-4 rounded transform -rotate-12 border-2 border-white shadow-lg text-lg">
                        SOLD OUT
                      </div>
                    </div>
                  )}

                  <div className="flex p-3 gap-3 h-full">
                    {/* Image */}
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-200 dark:bg-dark-700 rounded overflow-hidden">
                      {ad.images && ad.images.length > 0 ? (
                        <img src={`/${ad.images[0]}`} alt={ad.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                          <span className="text-3xl">📷</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 flex items-center gap-1">
                          {ad.level === 'verified' && <span className="text-green-500">✓</span>}
                          {ad.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 leading-relaxed">
                          {ad.description}
                        </p>
                        <p className="text-sm font-bold text-brand-magenta mt-1">
                          Rs {Number(ad.price).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-2 text-[11px] font-medium">
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <MapPin size={10} /> {ad.location}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            {ad.category}
                          </span>
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(ad.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                </Link>
              );
            })}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors font-medium"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded font-medium transition-colors ${
                      currentPage === i + 1 
                      ? 'bg-brand-magenta text-white' 
                      : 'bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default Home;
