import React from 'react';
import { Link } from "react-router-dom";

const DiscoverCard = ({ id, title, image, item }) => {
  return (
    <Link to={`/item/${id}`} state={{ item }}>
      <div className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 group-hover:bg-opacity-20" />
        </div>
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h3 className="text-xl font-bold font-mono">{title}</h3>
        </div>
      </div>
    </Link>
  );
};

export default DiscoverCard;