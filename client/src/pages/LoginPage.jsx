import React from 'react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-police-dark">
      <div className="w-full max-w-md glass-panel p-8 rounded-lg border border-police-accent/30 shadow-glow-blue">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-police-cyan">KSP platform</h2>
          <p className="text-xs text-police-teal mt-1">Law Enforcement Intelligence Hub</p>
        </div>
        
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Username</label>
            <input 
              type="text" 
              placeholder="e.g. investigator.shekhar@ksp.gov.in"
              className="w-full bg-police-navy border border-police-accent/50 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-police-cyan"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-police-navy border border-police-accent/50 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-police-cyan"
              disabled
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-police-teal to-police-cyan text-police-dark font-bold py-3 rounded text-sm tracking-wide opacity-50 cursor-not-allowed" 
            disabled
          >
            Access Portal
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
