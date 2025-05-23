import React from 'react';
import Section from './Section';
import VersionBadge from '../VersionBadge';

const MainContent = () => {
  const sections = [
    {
      title: "Generate a video",
      items: [
        "Create short video",
        "Make explainer video",
        "Create animated film",
        "Use my script"
      ]
    }
  ];

  return (
    <div className="ml-64 p-8">
      <div className="mb-8">
        <VersionBadge version="V3.0" />
        <p className="mt-2 text-gray-700">
          Give me a topic, premise and detailed instructions in any language.
        </p>
      </div>

      <hr className="my-6 border-gray-300" />

      {sections.map((section, index) => (
        <Section key={index} title={section.title} items={section.items} />
      ))}

      <hr className="my-6 border-gray-300" />

      <div className="flex space-x-4 text-gray-600">
        <p className="font-semibold">Workflows</p>
        <p className="font-semibold">Plugins</p>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Invideo AI can make mistakes. Check important info.
      </p>
    </div>
  );
};

export default MainContent;