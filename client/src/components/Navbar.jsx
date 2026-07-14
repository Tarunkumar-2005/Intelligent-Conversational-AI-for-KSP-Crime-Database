import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Dropdown, DropdownItem } from './UIPrimitives.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, toggleSidebar, addNotification } = useUI();
  const { language, setLanguage, t } = useLanguage();

  const handleAlertClick = () => {
    const alerts = [
      { type: 'warning', msg: 'System warning: Server resource utilization exceeds 85%.' },
      { type: 'success', msg: 'Report completed: Cyber fraud audit PDF generated successfully.' },
      { type: 'error', msg: 'Threat Alert: Suspicious login attempt blocked for badge KSP-2025-1004.' },
      { type: 'info', msg: 'Sync completed: 14 fresh FIR records loaded from Mysuru City Division.' }
    ];
    const pick = alerts[Math.floor(Math.random() * alerts.length)];
    addNotification(pick.type, pick.msg);
  };

  return (
    <header className="h-16 px-4 md:px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-[#0b1329]/40 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-40 transition-colors duration-200">
      <div className="flex items-center gap-3 flex-1">
        {/* Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center max-w-xs w-full relative">
          <span className="absolute left-3 text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search FIR, Criminals, Pincodes..."
            className="w-full bg-slate-100 text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:bg-white focus:border-blue-500 dark:bg-[#070e1b] dark:text-slate-200 dark:focus:bg-[#08101f] dark:focus:border-cyan-500/60 focus:outline-none transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Alerts Trigger */}
        <button
          type="button"
          onClick={handleAlertClick}
          className="p-2 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors relative"
          title="Simulate Random Alert Notification"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-cyan-400 border border-white dark:border-[#0b1329] animate-pulse"></span>
        </button>

        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.072 0l-7.072 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => {
            const nextLang = language === 'en' ? 'kn' : 'en';
            setLanguage(nextLang);
            addNotification('success', nextLang === 'en' ? 'Language updated successfully to English.' : 'ಭಾಷೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.');
          }}
          className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          title="Toggle Language"
        >
          {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>

        {/* User Dropdown Profile Menu */}
        {user && (
          <Dropdown
            align="right"
            trigger={
              <div className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-1.5 rounded transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                {/* Simulated Avatar Initials */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center border border-white/20">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="hidden lg:flex flex-col text-left select-none">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{user.name}</span>
                  <span className="text-[9px] text-slate-400 dark:text-cyan-400/80 font-bold uppercase tracking-wider mt-0.5">{user.role}</span>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            }
          >
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Badge: <span className="font-bold text-slate-600 dark:text-slate-300">{user.badgeNumber}</span>
            </div>
            {user.policeStation && (
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Station Code: <span className="font-bold text-slate-600 dark:text-slate-300">Active Duty</span>
              </div>
            )}
            <DropdownItem onClick={logout} className="text-red-500 hover:bg-red-500/5 hover:text-red-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out Session
            </DropdownItem>
          </Dropdown>
        )}
      </div>
    </header>
  );
};

export default Navbar;
