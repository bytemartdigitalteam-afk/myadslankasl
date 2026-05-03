import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, Users, Settings, Tag, PlusCircle, Trash, Star, Eye, ThumbsUp, LogOut, Bell, Search, Edit, BadgeCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalAds: 0, pendingAds: 0, approvedAds: 0 });
  const [adsList, setAdsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [verificationsList, setVerificationsList] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newPassword, setNewPassword] = useState('');
  
  // Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('tag');

  // Agent Form
  const [agentForm, setAgentForm] = useState({ id: null, name: '', whatsapp: '', logo: null });
  const [isEditingAgent, setIsEditingAgent] = useState(false);

  // Edit Ad Metrics
  const [editingAd, setEditingAd] = useState(null);
  const [editViews, setEditViews] = useState(0);
  const [editLikes, setEditLikes] = useState(0);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${user?.token}` }
  };

  useEffect(() => {
    fetchStats();
    fetchAds();
    fetchUsers();
    fetchCategories();
    fetchAgents();
    fetchVerifications();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats', axiosConfig);
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAds = async () => {
    try {
      const res = await axios.get('/api/admin/ads', axiosConfig);
      setAdsList(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', axiosConfig);
      setUsersList(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories', axiosConfig);
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/admin/agents', axiosConfig);
      setAgentsList(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchVerifications = async () => {
    try {
      const res = await axios.get('/api/admin/verifications', axiosConfig);
      setVerificationsList(res.data);
    } catch (err) { console.error(err); }
  };

  // Ad Actions
  const handleStatusChange = async (adId, status) => {
    try {
      await axios.put(`/api/admin/ads/${adId}/status`, { status }, axiosConfig);
      fetchStats();
      fetchAds();
    } catch (err) { alert('Error updating status'); }
  };

  const handleLevelChange = async (adId, level) => {
    try {
      await axios.put(`/api/admin/ads/${adId}/level`, { level }, axiosConfig);
      fetchAds();
    } catch (err) { alert('Error updating level'); }
  };

  const handleDeleteAd = async (adId) => {
    if(!window.confirm("Are you sure you want to delete this ad?")) return;
    try {
      await axios.delete(`/api/admin/ads/${adId}`, axiosConfig);
      fetchStats();
      fetchAds();
    } catch (err) { alert('Error deleting ad'); }
  };

  const handleUpdateMetrics = async (e) => {
    e.preventDefault();
    if(!editingAd) return;
    try {
      await axios.put(`/api/admin/ads/${editingAd._id}/metrics`, { views: editViews, likes: editLikes }, axiosConfig);
      setEditingAd(null);
      fetchAds();
    } catch (err) { alert('Error updating metrics'); }
  };

  // Category Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/categories', { name: newCatName, icon: newCatIcon }, axiosConfig);
      setNewCatName('');
      fetchCategories();
    } catch (err) { alert(err.response?.data?.message || 'Error adding category'); }
  };

  const handleDeleteCategory = async (catId) => {
    if(!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`/api/admin/categories/${catId}`, axiosConfig);
      fetchCategories();
    } catch (err) { alert('Error deleting category'); }
  };

  // Agent Actions
  const handleAgentSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', agentForm.name);
      formData.append('whatsapp', agentForm.whatsapp);
      if (agentForm.logo) formData.append('logo', agentForm.logo);

      if (isEditingAgent) {
        await axios.put(`/api/admin/agents/${agentForm.id}`, formData, {
          headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/admin/agents', formData, {
          headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' }
        });
      }

      setAgentForm({ id: null, name: '', whatsapp: '', logo: null });
      setIsEditingAgent(false);
      fetchAgents();
    } catch (err) { alert(err.response?.data?.message || 'Error saving agent'); }
  };

  const handleDeleteAgent = async (agentId) => {
    if(!window.confirm("Delete this agent?")) return;
    try {
      await axios.delete(`/api/admin/agents/${agentId}`, axiosConfig);
      fetchAgents();
    } catch (err) { alert('Error deleting agent'); }
  };

  const editAgent = (agent) => {
    setIsEditingAgent(true);
    setAgentForm({ id: agent._id, name: agent.name, whatsapp: agent.whatsapp, logo: null });
    setActiveTab('agents');
  };

  const handleVerificationStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/verifications/${id}/status`, { status }, axiosConfig);
      fetchVerifications();
      fetchUsers();
    } catch (err) { alert('Error updating verification status'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/admin/change-password', { newPassword }, axiosConfig);
      alert('Password updated successfully!');
      setNewPassword('');
    } catch (err) { alert('Error changing password'); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
        activeTab === id 
          ? 'bg-brand-magenta text-white border-l-4 border-white' 
          : 'text-gray-400 hover:bg-[#1f2937] hover:text-white border-l-4 border-transparent'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#0a101f] text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-magenta rounded flex items-center justify-center font-bold text-lg">M</div>
            <span className="text-xl font-bold tracking-tight">MyAds<span className="text-brand-magenta">Lanka</span></span>
          </div>
        </div>
        <div className="flex-1 py-6 overflow-y-auto">
          <div className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</div>
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="ads" icon={List} label="Manage Ads" />
          <NavItem id="categories" icon={Tag} label="Manage Categories" />
          <NavItem id="agents" icon={BadgeCheck} label="Manage Agents" />
          <NavItem id="verifications" icon={BadgeCheck} label="User Verifications" />
          <NavItem id="users" icon={Users} label="Manage Users" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</div>
          <NavItem id="settings" icon={Settings} label="General Settings" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[#0a101f] border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search here..." 
                className="w-full bg-[#161d2d] text-white text-sm rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/post-ad" className="flex items-center gap-2 text-sm bg-brand-magenta hover:bg-pink-600 text-white px-4 py-2 rounded transition-colors">
              <PlusCircle size={16} />
              Post Ad
            </Link>
            <button className="text-gray-300 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a101f]"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-gray-700 pl-6 cursor-pointer">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                A
              </div>
              <span className="text-sm font-medium text-gray-200">Admin</span>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors ml-2">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 bg-[#f3f4f6]">
          
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              
              {/* Stat Cards - Matching SocialMate colors */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><Users size={100} /></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <h3 className="text-blue-100 text-sm font-medium mb-1">Total Users</h3>
                      <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Users size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><List size={100} /></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <h3 className="text-green-100 text-sm font-medium mb-1">Active Listings</h3>
                      <p className="text-3xl font-bold">{stats.approvedAds}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <List size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><Star size={100} /></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <h3 className="text-orange-100 text-sm font-medium mb-1">Pending Approvals</h3>
                      <p className="text-3xl font-bold">{stats.pendingAds}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Star size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><Tag size={100} /></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <h3 className="text-purple-100 text-sm font-medium mb-1">Categories</h3>
                      <p className="text-3xl font-bold">{categories.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Tag size={24} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Simple Chart Simulation Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-700 font-bold mb-6">Listings Overview</h3>
                  <div className="h-64 flex items-end gap-4 border-b border-gray-200 pb-2 relative">
                    <div className="w-full flex items-end justify-around h-full">
                      <div className="w-16 bg-blue-500 rounded-t-sm" style={{height: '40%'}}></div>
                      <div className="w-16 bg-green-500 rounded-t-sm" style={{height: '80%'}}></div>
                      <div className="w-16 bg-orange-500 rounded-t-sm" style={{height: '20%'}}></div>
                      <div className="w-16 bg-purple-500 rounded-t-sm" style={{height: '60%'}}></div>
                    </div>
                  </div>
                  <div className="flex justify-around mt-4 text-sm text-gray-500">
                    <span>Cars</span>
                    <span>Electronics</span>
                    <span>Jobs</span>
                    <span>Real Estate</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-700 font-bold mb-6">User Activity</h3>
                  <div className="h-64 flex items-center justify-center relative">
                    {/* Simulated Pie Chart using conic-gradient */}
                    <div className="w-48 h-48 rounded-full" style={{background: 'conic-gradient(#3b82f6 0% 40%, #10b981 40% 75%, #f59e0b 75% 100%)'}}>
                      <div className="w-32 h-32 bg-white rounded-full mx-auto mt-8 flex items-center justify-center shadow-inner">
                        <span className="font-bold text-gray-700">100%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Desktop</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Mobile</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> Tablet</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="animate-fade-in bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Manage All Listings</h2>
                <Link to="/post-ad" className="bg-brand-magenta hover:bg-pink-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors">
                  <PlusCircle size={16}/> Create Ad
                </Link>
              </div>

              {/* Edit Metrics Modal */}
              {editingAd && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                    <h3 className="text-lg font-bold mb-4">Edit Metrics: {editingAd.title}</h3>
                    <form onSubmit={handleUpdateMetrics}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Views</label>
                        <input type="number" value={editViews} onChange={e=>setEditViews(e.target.value)} className="w-full border rounded p-2 focus:outline-brand-magenta"/>
                      </div>
                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Likes</label>
                        <input type="number" value={editLikes} onChange={e=>setEditLikes(e.target.value)} className="w-full border rounded p-2 focus:outline-brand-magenta"/>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={()=>setEditingAd(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-magenta text-white rounded hover:bg-pink-600">Save</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 font-semibold text-gray-600 text-sm">Ad Details</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Level (Rank)</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Metrics</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adsList.map(ad => (
                      <tr key={ad._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{ad.title}</p>
                          <p className="text-xs text-gray-500">{ad.category} • Rs. {ad.price}</p>
                          {ad.contactNumber && <p className="text-xs text-blue-600 mt-1 font-medium">📞 {ad.contactNumber}</p>}
                          {ad.paymentSlip && (
                            <a href={`/${ad.paymentSlip}`} target="_blank" rel="noopener noreferrer" className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 inline-block font-bold">
                              View Payment Slip
                            </a>
                          )}
                        </td>
                        <td className="p-4">
                          <select 
                            value={ad.status} 
                            onChange={(e) => handleStatusChange(ad._id, e.target.value)}
                            className={`text-xs font-bold py-1 px-2 rounded outline-none border-0 ${
                              ad.status === 'approved' ? 'bg-green-100 text-green-700' : 
                              ad.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select 
                            value={ad.level || 'normal'} 
                            onChange={(e) => handleLevelChange(ad._id, e.target.value)}
                            className={`text-xs font-bold py-1 px-2 rounded outline-none border border-gray-200 ${
                              ['vip', 'vvip'].includes(ad.level) ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              ad.level === 'fake' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700'
                            }`}
                          >
                            <option value="normal">Normal</option>
                            <option value="verified">Verified</option>
                            <option value="vip">VIP</option>
                            <option value="vvip">VVIP</option>
                            <option value="fake">Fake Ad</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><Eye size={14} className="text-blue-500"/> {ad.views || 0}</span>
                            <span className="flex items-center gap-1"><ThumbsUp size={14} className="text-pink-500"/> {ad.likes || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setEditingAd(ad); setEditViews(ad.views||0); setEditLikes(ad.likes||0); }}
                              className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                              title="Edit Metrics"
                            ><Edit size={16}/></button>
                            <button 
                              onClick={() => handleDeleteAd(ad._id)}
                              className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                              title="Delete Ad"
                            ><Trash size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white rounded-lg shadow p-6 h-fit">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Add Category</h2>
                <form onSubmit={handleAddCategory}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                    <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-brand-magenta" placeholder="e.g. Electronics"/>
                  </div>
                  <button type="submit" className="w-full bg-brand-magenta hover:bg-pink-600 text-white font-medium py-2 px-4 rounded transition-colors flex justify-center items-center gap-2">
                    <PlusCircle size={18}/> Add Category
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Existing Categories</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(cat => (
                    <div key={cat._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-brand-magenta transition-colors bg-gray-50">
                      <span className="font-medium text-gray-700">{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors">
                        <Trash size={16}/>
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-gray-500 col-span-3">No categories found.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-fade-in bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Registered Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Email</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">{u.name}</td>
                        <td className="p-4 text-gray-600">{u.email}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in bg-white rounded-lg shadow p-6 max-w-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Settings size={18}/> Change Admin Password</h3>
                <form onSubmit={handleChangePassword}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-300 bg-white rounded-md py-2 px-3 focus:outline-brand-magenta" 
                      placeholder="Enter strong password"
                      required 
                    />
                  </div>
                  <button type="submit" className="bg-brand-magenta hover:bg-pink-700 text-white font-medium py-2 px-6 rounded transition-colors shadow-sm">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="animate-fade-in bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Ad Agents</h2>

              <form onSubmit={handleAgentSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 max-w-lg">
                <h3 className="font-bold text-gray-700 mb-4">{isEditingAgent ? 'Edit Agent' : 'Add New Agent'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Agent Name</label>
                    <input 
                      type="text" 
                      required 
                      value={agentForm.name} 
                      onChange={e=>setAgentForm({...agentForm, name: e.target.value})}
                      className="w-full border p-2 rounded focus:outline-brand-magenta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">WhatsApp Number</label>
                    <input 
                      type="text" 
                      required 
                      value={agentForm.whatsapp} 
                      onChange={e=>setAgentForm({...agentForm, whatsapp: e.target.value})}
                      className="w-full border p-2 rounded focus:outline-brand-magenta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Agent Logo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e=>setAgentForm({...agentForm, logo: e.target.files[0]})}
                      className="w-full border p-2 rounded focus:outline-brand-magenta bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-brand-magenta text-white px-4 py-2 rounded text-sm font-medium hover:bg-pink-600 transition-colors">
                      {isEditingAgent ? 'Update Agent' : 'Save Agent'}
                    </button>
                    {isEditingAgent && (
                      <button type="button" onClick={() => { setIsEditingAgent(false); setAgentForm({id:null, name:'', whatsapp:'', logo:null}); }} className="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-500 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentsList.map(agent => (
                  <div key={agent._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {agent.logoUrl ? <img src={`/${agent.logoUrl}`} alt={agent.name} className="w-full h-full object-cover"/> : <BadgeCheck size={24} className="text-brand-magenta"/>}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{agent.name}</p>
                        <p className="text-xs text-gray-500">WA: {agent.whatsapp}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editAgent(agent)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded">
                        <Edit size={16}/>
                      </button>
                      <button onClick={() => handleDeleteAgent(agent._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded">
                        <Trash size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
                {agentsList.length === 0 && <p className="text-gray-500 text-sm">No agents added yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="animate-fade-in bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><BadgeCheck className="text-brand-magenta"/> User Verifications</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 font-semibold text-gray-600 text-sm">User</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Details</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Images</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationsList.map(req => (
                      <tr key={req._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">
                          <div>{req.fullName}</div>
                          <div className="text-xs text-gray-500">{req.user?.email}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <div>Loc: {req.location}</div>
                          <div>{req.gender}, {new Date(req.birthday).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {req.images.map((img, i) => (
                              <a key={i} href={`/${img}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">Image {i+1}</a>
                            ))}
                            <a href={`/${req.paymentSlip}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline font-medium">Payment Slip</a>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 flex flex-col items-end gap-2">
                          {req.status === 'pending' && (
                            <>
                              <button onClick={() => handleVerificationStatus(req._id, 'approved')} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 w-full text-center">Approve</button>
                              <button onClick={() => handleVerificationStatus(req._id, 'rejected')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 w-full text-center">Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {verificationsList.length === 0 && (
                      <tr><td colSpan="5" className="p-4 text-center text-gray-500">No verification requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
