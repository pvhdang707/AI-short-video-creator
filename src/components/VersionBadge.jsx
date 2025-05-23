import React from 'react';

const VersionBadge = ({ version }) => {
  return (
    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-bold">
      {version}
    </span>
  );
};

export default VersionBadge;