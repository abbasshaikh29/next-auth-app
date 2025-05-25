"use client";

import React from 'react';

interface LegalTabNavigationProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

const LegalTabNavigation: React.FC<LegalTabNavigationProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="w-full md:w-64 p-4 border-r border-gray-200 bg-white">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 px-2 pt-2">TheTribelab Legal</h2>
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`
              w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400
              ${activeTab === tab.id
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default LegalTabNavigation;
