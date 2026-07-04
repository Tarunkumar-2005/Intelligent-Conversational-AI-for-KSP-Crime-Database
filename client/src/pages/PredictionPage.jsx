import React from 'react';

const PredictionPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-display font-bold text-police-cyan mb-2">Predictive Crime Forecasting</h1>
      <p className="text-gray-400 mb-6">Statistical algorithms and trend forecasting metrics displaying projected early-warning hotspots.</p>
      
      <div className="glass-panel p-6 rounded-lg border border-police-accent/30 text-center py-12">
        <p className="text-gray-500">Forecasting engine is loaded. Initialize historical database cases to display early warnings.</p>
      </div>
    </div>
  );
};

export default PredictionPage;
