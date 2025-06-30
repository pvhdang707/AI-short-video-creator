import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import { MdVideoCall, MdLogout, MdLogin, MdPersonAdd } from 'react-icons/md';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      items: [
        { name: 'Explore', path: '/explore' },
        { name: 'Gallery', path: '/gallery' },
      ]
    },
    {
      title: "AI Create",
      items: [
        { name: 'Create Video', path: '/create-video' },
        // { name: 'Create Image', path: '/create-image/image-generation' },
      ]
    },
    // {
    //   title: "Preset library",
    //   items: [
    //     { name: 'AI mins: 0.00/10 mins', path: '/ai-mins' }
    //   ]
    // }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-72 bg-gradient-to-br from-gray-900 to-gray-800 p-4 h-screen fixed left-0 top-0 flex flex-col shadow-2xl border-r border-gray-700/50 sidebar-container">
      {/* Header với logo */}
      <div className="mb-8 sidebar-header">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center logo-glow">
            <MdVideoCall className="w-6 h-6 text-white float-animation" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              AI Video Creator
            </h1>
            <p className="text-xs text-gray-400">Create amazing videos</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
      </div>

      {/* Phần menu chính */}
      <div className="flex-grow space-y-2 sidebar-menu overflow-y-auto">        
        {menuItems.map((section, index) => (
          <SidebarSection 
            key={index} 
            title={section.title}
          >
            {section.items.map((item, itemIndex) => (
              <SidebarItem 
                key={itemIndex}
                name={item.name}
                path={item.path}
                isActive={location.pathname === item.path}
              />
            ))}
          </SidebarSection>
        ))}
        
        
      </div>

      {/* Phần thông tin người dùng và đăng xuất */}
      <div className="mt-auto pt-6 sidebar-footer">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent mb-4"></div>
        
        
        
        {user ? (
          <div className="space-y-4">
            <div className="glass-effect rounded-xl p-4 border border-gray-600/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Welcome back</p>
                  <p className="font-medium text-white text-sm">{user.username}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full group flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 border border-red-600/30 text-red-400 hover:text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 ripple"
            >
              <MdLogout className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/login')}
              className="w-full group flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 ripple"
            >
              <MdLogin className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Login</span>
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="w-full group flex items-center justify-center space-x-2 px-4 py-3 border border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-700/20 rounded-xl transition-all duration-300 hover:border-gray-500 ripple"
            >
              <MdPersonAdd className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Sign up</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;