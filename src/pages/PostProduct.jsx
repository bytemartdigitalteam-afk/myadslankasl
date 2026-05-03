import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = '/api';

const PostProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Vehicles',
    location: '',
    contactNumber: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/categories`, { timeout: 10000 });
        if (Array.isArray(res.data)) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, category: res.data[0].name }));
          }
        } else {
          console.error("Categories response is not an array:", res.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const { title, description, price, category, location, contactNumber } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim() || !price || !location.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', title.trim());
      data.append('description', description.trim());
      data.append('price', price);
      data.append('category', category);
      data.append('location', location.trim());
      data.append('contactNumber', contactNumber.trim());
      data.append('adType', 'product'); // Explicitly mark as product ad
      images.forEach(img => data.append('images', img));

      await axios.post(`${API_URL}/ads`, data, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      setSuccess('Product Ad posted successfully! It will be visible after admin approval.');
      setFormData({ title: '', description: '', price: '', category: 'Vehicles', location: '', contactNumber: '' });
      setImages([]);
      setPreviews([]);

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to post product ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Notice Message */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded shadow-sm">
        <p className="font-medium text-sm md:text-base">
          දැන්වීමක් පල කිරීමට පෙර නියෝජිතයෙකු සම්බන්ද කරගන්න , එමගින් ඔබට ඉක්මන් සහ විශ්වාසනීය සේවාවක් ලබා ගත හැක
        </p>
      </div>

      <div className="bg-white dark:bg-dark-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-dark-700">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Post a Product Ad</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Title</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={onChange}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta"
              placeholder="Keep it short and descriptive"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
              <select
                name="category"
                value={category}
                onChange={onChange}
                className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta"
              >
                {categories.length > 0 ? categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                )) : <option>Vehicles</option>}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price (Rs)</label>
              <input
                type="number"
                name="price"
                value={price}
                onChange={onChange}
                className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={onChange}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta"
              placeholder="e.g. Colombo, Kandy"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={contactNumber}
              onChange={onChange}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta"
              placeholder="e.g. 0712345678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={description}
              onChange={onChange}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta h-32 resize-none"
              placeholder="Describe your product in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Upload Images</label>

            {/* Preview */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border border-gray-300 dark:border-dark-700">
                    <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded p-8 text-center text-gray-400 hover:border-brand-magenta hover:text-brand-magenta transition-colors cursor-pointer block">
              <Upload size={24} className="mx-auto mb-2" />
              <p>Click to upload or drag & drop images here</p>
              <p className="text-xs mt-2">Maximum 5 images. Max size 5MB each.</p>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={onImageChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-magenta hover:bg-pink-700 text-white font-medium py-3 text-lg rounded transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Posting Product...' : 'Post Product Ad Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostProduct;
