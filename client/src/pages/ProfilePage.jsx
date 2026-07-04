import React from 'react';

const ProfilePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-display font-bold text-police-cyan mb-2">Offender Profiling & Modus Operandi</h1>
      <p className="text-gray-400 mb-6">Profiles of repeat offenders, behavior analysis patterns, and predictive risk score dashboards.</p>
      
      <div className="glass-panel p-6 rounded-lg border border-police-accent/30 text-center py-12">
        <p className="text-gray-500">No offender records found. Awaiting mock dataset seed initialization in Phase 2.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
