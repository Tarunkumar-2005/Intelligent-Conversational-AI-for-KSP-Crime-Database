import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Network, 
  Map, 
  UserSquare2, 
  TrendingUp, 
  LogOut 
} from 'lucide-react';

const MainLayout = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'AI Chatbot', path: '/chat', icon: <MessageSquare size={20} /> },
    { name: 'Network Graph', path: '/network', icon: <Network size={20} /> },
    { name: 'Hotspot Map', path: '/map', icon: <Map size={20} /> },
    { name: 'Offender Profile', path: '/profile', icon: <UserSquare2 size={20} /> },
    { name: 'Predictions', path: '/prediction', icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-police-dark">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-police-navy border-r border-police-accent/30 flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-police-accent/30">
            <Link to="/" className="flex flex-col">
              <span className="font-display font-bold text-police-cyan leading-none">KSP ANALYTICS</span>
              <span className="text-[10px] text-police-teal tracking-widest uppercase mt-1">Investigation Portal</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-police-cyan/10 text-police-cyan border-l-2 border-police-cyan' 
                      : 'text-gray-400 hover:bg-police-blue/50 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer / User Profile section */}
        <div className="p-4 border-t border-police-accent/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">Logged in as:</p>
              <p className="text-sm font-semibold text-gray-300">Inspector Shekhar</p>
              <span className="text-[10px] bg-police-cyan/10 text-police-cyan px-2 py-0.5 rounded">Investigator</span>
            </div>
            <button className="text-gray-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-police-accent/30 flex items-center justify-between px-8 bg-police-navy/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-police-cyan animate-pulse"></span>
            <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">System Live Mode</span>
          </div>
          
          <div className="text-xs text-gray-400 font-mono">
            Location: Mysuru City Division
          </div>
        </header>

        {/* Dynamic Route Container */}
        <div className="flex-1 bg-police-dark/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
