import React from 'react';
import { Link } from 'react-router-dom';

const ServerErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e1b] text-white text-center p-6 relative overflow-hidden font-sans">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-950/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-950/10 rounded-full blur-[100px] animate-pulse delay-500"></div>

      <div className="relative w-full max-w-md bg-[#0b172a]/60 backdrop-blur-md border border-red-500/20 rounded-xl p-8 shadow-2xl">
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500 mb-6">
          <svg className="w-8 h-8 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-4xl font-extrabold font-display tracking-widest text-red-500 mb-2">500</h2>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">System Connection Interrupted</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-8">
          The central database server or Zoho Catalyst container is currently experiencing connection failures. Please check server logs and restart services.
        </p>

        <Link 
          to="/" 
          className="inline-block w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold py-3 rounded uppercase tracking-wider transition-all duration-300 shadow-md shadow-red-500/10"
        >
          Retry Connection
        </Link>
      </div>
    </div>
  );
};

export default ServerErrorPage;
