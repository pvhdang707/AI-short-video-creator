import React from 'react';

const SidebarSection = ({ title, children }) => {
  return (
    <div className="mb-6">
      {title && (
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            {title}
          </h2>
          <div className="h-px bg-gradient-to-r from-gray-600/30 to-transparent ml-3"></div>
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

export default SidebarSection;