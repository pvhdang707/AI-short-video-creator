import React from 'react';

const Section = ({ title, items }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <span className="mr-2">-</span>
            <span className="hover:text-blue-600 cursor-pointer">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Section;