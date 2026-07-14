import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const { login, user, error, setError, loading } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect them to home immediately
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Clear context error when input fields change
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Local form validation
    if (!email || !password) {
      setValidationError('Please fill in all credentials.');
      return;
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address (e.g. investigator.shekhar@ksp.gov.in).');
      return;
    }

    // Password length validation
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    // Dispatch login context API request
    const result = await login(email, password);
    if (result && result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e1b] relative overflow-hidden font-sans">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md p-6 relative z-10">
        {/* Glassmorphic Panel container */}
        <div className="bg-[#0b172a]/75 backdrop-blur-md p-8 rounded-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
          
          <div className="text-center mb-8">
            {/* Badge Emblem Shield */}
            <div className="mx-auto w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 text-cyan-400 mb-4">
              <svg 
                className="w-8 h-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold tracking-wider text-cyan-400 uppercase font-display">
              KSP portal
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-1">
              Law Enforcement Intelligence Hub
            </p>
          </div>

          {/* Validation and Context Error Panels */}
          {(validationError || error) && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded mb-6 flex items-start gap-2.5 animate-[fadeIn_0.3s_ease-out]">
              <svg 
                className="w-4 h-4 mt-0.5 shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <div>{validationError || error}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Police email
              </label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator.shekhar@ksp.gov.in"
                className="w-full bg-[#08101f] border border-cyan-500/10 hover:border-cyan-500/30 focus:border-cyan-500/60 rounded px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors duration-200"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Security Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#08101f] border border-cyan-500/10 hover:border-cyan-500/30 focus:border-cyan-500/60 rounded px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors duration-200"
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className={`w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded text-xs tracking-wider uppercase transition-all duration-300 shadow-lg shadow-cyan-500/10 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              disabled={loading}
            >
              {loading ? 'Verifying Secure Tunnel...' : 'Access Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
