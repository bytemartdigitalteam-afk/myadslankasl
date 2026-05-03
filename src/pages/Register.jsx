import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-dark-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-dark-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Register</h1>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
            <input 
              type="text" 
              name="name"
              value={name}
              onChange={onChange}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta" 
              placeholder="Enter your name"
              required 
            />
          </div>

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
              placeholder="Enter your password (min 6 characters)"
              required 
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-magenta" 
              placeholder="Confirm your password"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-magenta hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
