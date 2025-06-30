import React from 'react';
import Sidebar from './Sidebar/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 h-full flex-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        
        {children}
      </div>
    </div>
  );
};

export default MainLayout;