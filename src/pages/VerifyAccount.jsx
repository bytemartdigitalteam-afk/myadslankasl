import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = '/api';

const VerifyAccount = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    gender: 'Male',
    birthday: '',
  });
  const [images, setImages] = useState([]);
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    // Check if user is already verified or pending
    const checkUserStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setCurrentUserData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    checkUserStatus();
  }, [user]);

  const { fullName, location, gender, birthday } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 2) {
      setError('Exactly 2 real images are required');
      return;
    }
    setImages(prev => [...prev, ...files]);

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

    if (!fullName || !location || !gender || !birthday) {
      setError('Please fill in all details');
      return;
    }

    if (images.length !== 2) {
      setError('You must upload exactly 2 real images of yourself');
      return;
    }

    if (!paymentSlip) {
      setError('Please upload the payment slip');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', fullName);
      data.append('location', location);
      data.append('gender', gender);
      data.append('birthday', birthday);
      images.forEach(img => data.append('images', img));
      data.append('paymentSlip', paymentSlip);

      await axios.post(`${API_URL}/auth/verify`, data, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Verification request submitted successfully! Please wait for admin approval.');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  if (currentUserData?.verificationStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShieldCheck size={64} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h2>
        <p className="text-gray-600">Your verification request is currently under review by our admin team.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 bg-brand-magenta text-white px-6 py-2 rounded">Go back</button>
      </div>
    );
  }

  if (currentUserData?.isVerified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShieldCheck size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verified</h2>
        <p className="text-gray-600">Congratulations! Your account is already verified.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 bg-brand-magenta text-white px-6 py-2 rounded">Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Privacy Notice */}
      <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 mb-6 rounded shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="flex-shrink-0 text-emerald-600" />
          <p className="font-medium text-sm md:text-base leading-relaxed">
            මෙම වෙබ් අඩවියේ දත්ත විකේතන ඇති බැවින්, මෙහි උඩුගත කරන තොරතුරු 100% ක්ම ආරාක්ශා කාරී වන අතර , එය කිසිවිටෙක එලියට නොයන දත්ත වේ.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-dark-700">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          Verify Your Account
        </h1>
        <p className="text-gray-500 mb-6">Complete the form below to get the Verified Badge on your profile.</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={fullName}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-300 rounded py-2 px-3 focus:outline-brand-magenta"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-300 rounded py-2 px-3 focus:outline-brand-magenta"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Gender</label>
              <select
                name="gender"
                value={gender}
                onChange={onChange}
                className="w-full bg-gray-50 border border-gray-300 rounded py-2 px-3 focus:outline-brand-magenta"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Birthday</label>
              <input
                type="date"
                name="birthday"
                value={birthday}
                onChange={onChange}
                className="w-full bg-gray-50 border border-gray-300 rounded py-2 px-3 focus:outline-brand-magenta"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">2 Real Images of Yourself</label>
            
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="border-2 border-dashed border-gray-300 rounded p-6 text-center text-gray-400 hover:border-brand-magenta transition-colors cursor-pointer block">
              <Upload size={24} className="mx-auto mb-2" />
              <p>Upload exactly 2 photos</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Payment Slip</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setPaymentSlip(e.target.files[0])}
              className="w-full bg-gray-50 border border-gray-300 rounded py-2 px-3 focus:outline-brand-magenta"
              required
            />
            {paymentSlip && <p className="text-xs text-green-600 mt-1 font-bold">File Selected: {paymentSlip.name}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-magenta hover:bg-pink-700 text-white font-medium py-3 text-lg rounded transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Submitting...' : 'Submit Verification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
