import { useState, useEffect } from 'react';
import axios from 'axios';
import { BadgeCheck, Phone, MessageCircle } from 'lucide-react';

const API_URL = '/api';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/agents`);
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-magenta border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <BadgeCheck className="text-brand-magenta" size={40} />
          Our Official Agents
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Contact one of our official authorized agents to get your ads published quickly, securely, and with verified status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent._id} className="bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            
            <div className="w-24 h-24 bg-gray-100 dark:bg-dark-700 rounded-full border-4 border-white dark:border-dark-800 shadow-md flex items-center justify-center overflow-hidden mb-4">
              {agent.logoUrl ? (
                <img src={`/${agent.logoUrl}`} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <BadgeCheck size={40} className="text-brand-magenta" />
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1 justify-center">
              {agent.name} <BadgeCheck size={16} className="text-blue-500" />
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Authorized Agent</p>
            
            <div className="w-full space-y-3 mt-auto">
              <a href={`tel:${agent.whatsapp}`} className="w-full block bg-gray-900 dark:bg-brand-magenta hover:bg-gray-800 dark:hover:bg-pink-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm">
                <span className="flex items-center justify-center gap-2">
                  <Phone size={16} /> Call Now
                </span>
              </a>
              <a href={`https://wa.me/${agent.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full block bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-2 px-4 rounded transition-colors text-sm">
                <span className="flex items-center justify-center gap-2">
                  <MessageCircle size={16} /> WhatsApp
                </span>
              </a>
            </div>

          </div>
        ))}

        {agents.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700">
            <BadgeCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">No agents available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;
