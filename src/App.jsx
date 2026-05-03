import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostAd from './pages/PostAd';
import PostProduct from './pages/PostProduct';
import AdminDashboard from './pages/AdminDashboard';
import AdDetails from './pages/AdDetails';
import Agents from './pages/Agents';
import VerifyAccount from './pages/VerifyAccount';

// Protected Route Component
const PrivateRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

function App() {
  return (
    <Router>
      {/* Dynamic background based on theme */}
      <div className="min-h-screen bg-brand-bgLight dark:bg-dark-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ad/:id" element={<AdDetails />} />
            <Route path="/agents" element={<Agents />} />
            
            {/* User Protected Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/post-ad" element={
              <PrivateRoute><PostAd /></PrivateRoute>
            } />
            <Route path="/post-product" element={
              <PrivateRoute><PostProduct /></PrivateRoute>
            } />
            <Route path="/verify-account" element={
              <PrivateRoute><VerifyAccount /></PrivateRoute>
            } />
            
            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <PrivateRoute requireAdmin={true}><AdminDashboard /></PrivateRoute>
            } />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-dark-800 py-6 text-center text-gray-600 dark:text-gray-400 mt-auto border-t border-gray-200 dark:border-dark-700">
          <p>&copy; {new Date().getFullYear()} MyAdsLanka. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
