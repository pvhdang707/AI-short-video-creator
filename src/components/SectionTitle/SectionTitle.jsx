import React from 'react';

const SectionTitle = ({ title }) => {
  return (
    <div className="flex items-center mb-6">
      <h2 className="text-3xl font-bold font-mono mr-4">{title}</h2>
      <div className="flex-1 border-t border-gray-700"></div>
    </div>
  );
};

export default SectionTitle;