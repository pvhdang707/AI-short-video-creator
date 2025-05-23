import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="w-64 bg-gradient-to-br from-gray-900 to-gray-800 p-3 h-screen fixed left-0 top-0 flex flex-col">
      {/* Phần menu chính */}
      <div className="flex-grow">
        <h1 className="text-2xl font-bold text-white mb-6">AI short video creator</h1>
        
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

      {/* Phần login/signin ở cuối */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="space-y-3">
          <button 
            onClick={handleLogin}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Login
          </button>
          <button 
            onClick={handleSignUp}
            className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;