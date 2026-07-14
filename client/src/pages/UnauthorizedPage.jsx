import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e1b] text-white font-sans relative overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-950/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-950/10 rounded-full blur-[100px] animate-pulse delay-500"></div>

      <div className="relative w-full max-w-lg mx-auto p-6">
        {/* Glassmorphic card boundary */}
        <div className="bg-[#0b172a]/60 backdrop-blur-md border border-red-500/20 rounded-xl p-8 shadow-2xl text-center">
          {/* Security Shield Lock Icon */}
          <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 text-red-500 mb-6 animate-bounce">
            <svg 
              className="w-10 h-10" 
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

          <h2 className="text-3xl font-display font-bold text-red-500 tracking-wider uppercase mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-cyan-400 font-semibold tracking-wide mb-6">
            Error 403: Forbidden Action
          </p>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            You do not possess the security clearance required to view this module. Access logs have been created and reported to system audit trails.
          </p>

          {/* User information panel */}
          {user && (
            <div className="bg-slate-900/50 border border-slate-800 rounded p-4 mb-8 text-left text-xs space-y-1 tracking-wide">
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">Name:</span> {user.name}
              </div>
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">Credentials:</span> {user.badgeNumber}
              </div>
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">Current Role:</span>{' '}
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-cyan-400 border border-cyan-500/20">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold px-6 py-3 rounded transition-all duration-300 shadow-md shadow-cyan-500/10"
            >
              Return to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
