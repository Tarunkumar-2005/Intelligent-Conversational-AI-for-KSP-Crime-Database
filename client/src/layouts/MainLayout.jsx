import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ToastList from '../components/ToastList.jsx';
import { useUI } from '../context/UIContext.jsx';

const MainLayout = () => {
  const { theme } = useUI();

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#030712] text-gray-200' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* Sidebar navigation panel */}
      <Sidebar />

      {/* Main Content shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Route outlet */}
        <main className="flex-1 overflow-y-auto relative flex flex-col justify-between">
          <div className="flex-1 pb-10">
            <Outlet />
          </div>

          {/* Secure Portal Footer */}
          <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-[#0b1329]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <div>
              © 2026 Karnataka State Police Department. All Rights Reserved.
            </div>
            <div className="flex items-center gap-1.5 text-blue-500 dark:text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 animate-pulse"></span>
              Secure SSL Encrypted Tunnel
            </div>
          </footer>
        </main>
      </div>

      {/* Floating real-time notifications */}
      <ToastList />
    </div>
  );
};

export default MainLayout;
