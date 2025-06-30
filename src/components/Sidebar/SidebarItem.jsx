import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MdVideoLibrary, 
  MdImage,
  MdTimer,
  MdExplore,
  MdVideocam,
  MdPlayArrow
} from 'react-icons/md';

const getIcon = (name) => {
  switch (name) {
    case 'Explore':
      return <MdExplore className="w-5 h-5" />;
    case 'Gallery':
      return <MdVideoLibrary className="w-5 h-5" />;
    case 'Create Image':
      return <MdImage className="w-5 h-5" />;
    case 'Create Video':
      return <MdVideocam className="w-5 h-5" />;
    case 'AI mins: 0.00/10 mins':
      return <MdTimer className="w-5 h-5" />;
    default:
      return <MdPlayArrow className="w-5 h-5" />;
  }
};

const SidebarItem = ({ name, path, isActive }) => {
  return (
    <Link 
      to={path}
      className={`group flex items-center px-3 py-3 mx-2 rounded-xl transition-all duration-300 relative overflow-hidden ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600/30 to-blue-700/30 text-white shadow-lg shadow-blue-600/20 border border-blue-600/40' 
          : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 hover:shadow-md hover:shadow-gray-700/20'
      }`}
    >
      {/* Background gradient cho active state */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-blue-600/20 animate-pulse"></div>
      )}
      
      {/* Icon container */}
      <div className={`relative z-10 mr-3 p-2 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
          : 'bg-gray-700/50 text-gray-300 group-hover:bg-gray-600/50 group-hover:text-white group-hover:scale-110'
      }`}>
        {getIcon(name)}
      </div>
      
      {/* Text */}
      <span className={`relative z-10 font-medium transition-all duration-300 ${
        isActive ? 'text-white' : 'group-hover:translate-x-1'
      }`}>
        {name}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-full"></div>
      )}
    </Link>
  );
};

export default SidebarItem;