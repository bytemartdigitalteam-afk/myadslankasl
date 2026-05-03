import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon, RefreshCw, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <nav className="bg-brand-magenta text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <div className="bg-white text-brand-magenta p-1 rounded">
              <span className="font-extrabold text-xl leading-none">M</span>
            </div>
            My Ads Lanka
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              className="bg-brand-red hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            {/* Login / Dashboard / Post Ad */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="bg-brand-red hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded transition-colors flex items-center gap-2 text-sm"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button 
                  onClick={logout}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-3 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-brand-red hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded transition-colors flex items-center gap-2 text-sm"
              >
                Login/Post Ad
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
