import React from 'react';

const SidebarSection = ({ title, children }) => {
  return (
    <div className="mb-8">
      {title && <h2 className="text-lg text-white font-semibold mb-2">{title}</h2>}
      <ul>
        {children}
      </ul>
    </div>
  );
};

export default SidebarSection;