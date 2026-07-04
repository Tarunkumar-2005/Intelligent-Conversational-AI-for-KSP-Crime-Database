import React from 'react';

const NetworkPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-display font-bold text-police-cyan mb-2">Criminal Network Linkages</h1>
      <p className="text-gray-400 mb-6">Interactive network analysis demonstrating relationships between FIRs, suspects, phones, bank accounts, and locations.</p>
      
      <div className="w-full h-[60vh] glass-panel rounded-lg border border-police-accent/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-police-cyan border-police-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Initializing Cytoscape rendering engine...</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
