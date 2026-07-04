import React from 'react';

const MapPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-display font-bold text-police-cyan mb-2">Crime Hotspot Geospatial Viewer</h1>
      <p className="text-gray-400 mb-6">Interactive geographical visualization of case incidents, hotspots, and nearby incidents.</p>
      
      <div className="w-full h-[60vh] glass-panel rounded-lg border border-police-accent/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Leaflet maps engine initializing...</p>
          <div className="text-xs text-police-teal">Required bounds: Karnataka, India</div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
