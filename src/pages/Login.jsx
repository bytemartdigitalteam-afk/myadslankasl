import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      // Redirect admin to admin dashboard, regular users to home
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to login. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-dark-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-dark-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Login</h1>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input 
              type="email" 
              name="email"
              value={email}
              onChange={onChange}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta" 
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <input 
              type="password" 
              name="password"
              value={password}
              onChange={onChange}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta" 
              placeholder="Enter your password"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Don't have an account? <Link to="/register" className="text-brand-magenta hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
