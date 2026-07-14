import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070e1b] text-white">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="relative flex flex-col items-center max-w-sm text-center px-6">
        {/* Animated Security Scanner Ring */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border border-blue-500/40 animate-ping"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg 
              className="w-8 h-8 text-cyan-200 animate-pulse" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        </div>

        {/* Informative text */}
        <h3 className="text-xl font-bold tracking-wider text-cyan-400 uppercase mb-2 font-display">
          Establishing Secure Session
        </h3>
        <p className="text-xs text-slate-400 tracking-wide">
          Verifying security certificates and credentials...
        </p>

        {/* Loading progress bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-6 border border-slate-700/30">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-2/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
