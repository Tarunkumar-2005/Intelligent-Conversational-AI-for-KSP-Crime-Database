import React from 'react';

const DashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-display font-bold text-police-cyan mb-2">Crime Analytics Dashboard</h1>
      <p className="text-gray-400">Welcome to the Karnataka State Police Crime Analytics Platform. Select modules from the navigation bar.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="glass-panel p-6 rounded-lg border border-police-accent/30">
          <h2 className="text-xl font-bold mb-2">Total Registered FIRs</h2>
          <div className="text-4xl font-display font-bold text-police-teal">0</div>
          <span className="text-xs text-gray-500">Awaiting database connection...</span>
        </div>
        <div className="glass-panel p-6 rounded-lg border border-police-accent/30">
          <h2 className="text-xl font-bold mb-2">Active Investigations</h2>
          <div className="text-4xl font-display font-bold text-yellow-500">0</div>
          <span className="text-xs text-gray-500">Awaiting database connection...</span>
        </div>
        <div className="glass-panel p-6 rounded-lg border border-police-accent/30">
          <h2 className="text-xl font-bold mb-2">Repeat Offenders Tracked</h2>
          <div className="text-4xl font-display font-bold text-red-500">0</div>
          <span className="text-xs text-gray-500">Awaiting database connection...</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
