import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MdVideoLibrary, 
  MdImage,
  MdTimer,
  MdExplore,
  MdVideocam
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
      return null;
  }
};

const SidebarItem = ({ name, path, isActive }) => {
  return (
    <li className="py-2">
      <Link 
        to={path}
        className={`flex items-center px-6 py-2 text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-colors duration-200 ${
          isActive ? 'bg-gray-600 font-medium' : ''
        }`}
      >
        <span className="mr-2">{getIcon(name)}</span>
        {name}
      </Link>
    </li>
  );
};

export default SidebarItem;