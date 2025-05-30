import React from 'react';
import ItemCard from '../../components/ItemCard/ItemCard';
import sampleItems from '../../data/sampleItems.json';

const Dashboard = () => {
  const items = sampleItems.items;
  
  // Mock statistics data
  const stats = {
    totalProjects: items.length,
    activeProjects: items.filter(item => item.status === 'active').length,
    completedVideos: items.filter(item => item.status === 'completed').length,
    inProgress: items.filter(item => item.status === 'processing').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="p-6 rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold">Dashboard</h2>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              Create New Project
            </button>
            <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
              Manage
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-2">Total Projects</h3>
            <p className="text-3xl font-bold">{stats.totalProjects}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-2">Active Projects</h3>
            <p className="text-3xl font-bold">{stats.activeProjects}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-2">Completed Videos</h3>
            <p className="text-3xl font-bold">{stats.completedVideos}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-2">In Progress</h3>
            <p className="text-3xl font-bold">{stats.inProgress}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <span className="block text-sm text-gray-400">Create New Video</span>
            </button>
            <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <span className="block text-sm text-gray-400">Manage Templates</span>
            </button>
            <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <span className="block text-sm text-gray-400">Settings</span>
            </button>
            <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <span className="block text-sm text-gray-400">Reports</span>
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Recent Projects</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300">
              View All
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg bg-gray-800">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 font-mono text-lg">No projects have been created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  image={item.image}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;