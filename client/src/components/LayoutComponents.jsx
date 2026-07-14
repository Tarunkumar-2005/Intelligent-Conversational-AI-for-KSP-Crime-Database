import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Reusable Page container with transition fade-ins
 */
export const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-[fadeIn_0.3s_ease-out] ${className}`}>
      {children}
    </div>
  );
};

/**
 * Reusable Header with breadcrumbs and action triggers
 */
export const PageHeader = ({ title, description, actions, breadcrumbs }) => {
  const location = useLocation();

  // Generate dynamic breadcrumbs if not explicitly passed
  const getBreadcrumbs = () => {
    if (breadcrumbs) return breadcrumbs;
    const paths = location.pathname.split('/').filter(x => x);
    return [
      { name: 'Portal', path: '/' },
      ...paths.map((p, index) => {
        const path = `/${paths.slice(0, index + 1).join('/')}`;
        // Capitalize and format path name
        const name = p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { name, path };
      })
    ];
  };

  const crumbs = getBreadcrumbs();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
      <div>
        {/* Breadcrumb List */}
        <nav className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {crumbs.map((c, index) => (
            <React.Fragment key={c.path}>
              {index > 0 && <span className="text-slate-500">/</span>}
              {index === crumbs.length - 1 ? (
                <span className="text-blue-500 dark:text-cyan-400 font-semibold">{c.name}</span>
              ) : (
                <Link to={c.path} className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  {c.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-white tracking-wide">
          {title}
        </h1>
        {description && (
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

/**
 * Reusable Statistic Card widget
 */
export const StatCard = ({ title, value, change, trend = 'neutral', icon, color = 'blue' }) => {
  const trends = {
    up: 'text-green-500 bg-green-500/10 dark:bg-green-950/20',
    down: 'text-red-500 bg-red-500/10 dark:bg-red-950/20',
    neutral: 'text-slate-500 bg-slate-500/10',
  };

  const colors = {
    blue: 'border-l-blue-500 shadow-blue-500/5',
    cyan: 'border-l-cyan-500 shadow-cyan-500/5',
    yellow: 'border-l-yellow-500 shadow-yellow-500/5',
    red: 'border-l-red-500 shadow-red-500/5',
    green: 'border-l-green-500 shadow-green-500/5',
  };

  return (
    <div className={`
      bg-white dark:bg-[#0b172a]/60 border-l-4 rounded shadow-sm p-5 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-4
      ${colors[color]}
    `}>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <h3 className="text-3xl font-bold font-display text-slate-800 dark:text-white tracking-wide">{value}</h3>
        {change && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trends[trend]}`}>{change}</span>
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase">vs last month</span>
          </div>
        )}
      </div>
      
      {icon && (
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/40 shadow-inner">
          {icon}
        </div>
      )}
    </div>
  );
};

/**
 * Reusable Card container panel
 */
export const DashboardCard = ({ title, children, actions, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-[#0b172a]/60 border border-slate-200 dark:border-slate-800/80 rounded shadow-sm backdrop-blur-md flex flex-col ${className}`}>
      {title && (
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {title}
          </h3>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col">{children}</div>
    </div>
  );
};

/**
 * Reusable Spinner Loader
 */
export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 w-full ${className}`}>
      <div className={`animate-spin rounded-full border-t-blue-500 dark:border-t-cyan-500 border-slate-200 dark:border-slate-800 ${sizes[size]}`}></div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Intelligence Context...</p>
    </div>
  );
};

/**
 * Reusable Empty state warning panel
 */
export const EmptyState = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 py-12 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800/30 mb-4 shadow-inner">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4h12z" />
          </svg>
        )}
      </div>
      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  );
};
