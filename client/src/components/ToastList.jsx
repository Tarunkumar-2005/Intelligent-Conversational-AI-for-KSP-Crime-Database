import React from 'react';
import { useUI } from '../context/UIContext.jsx';

const ToastList = () => {
  const { notifications, dismissNotification } = useUI();

  if (notifications.length === 0) return null;

  const icons = {
    success: (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const borders = {
    success: 'border-l-green-500 focus:ring-green-500 dark:border-green-500/30',
    error: 'border-l-red-500 focus:ring-red-500 dark:border-red-500/30',
    warning: 'border-l-yellow-500 focus:ring-yellow-500 dark:border-yellow-500/30',
    info: 'border-l-cyan-500 focus:ring-cyan-500 dark:border-cyan-500/30',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`
            pointer-events-auto border-l-4 rounded bg-white dark:bg-[#0b172a] shadow-xl p-4 flex items-start gap-3 border border-slate-200 dark:border-slate-800 animate-[slideInRight_0.2s_ease-out]
            ${borders[n.type]}
          `}
        >
          <div className="shrink-0 pt-0.5">{icons[n.type]}</div>
          <div className="flex-1 text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-semibold pr-2 select-text">
            {n.message}
          </div>
          <button
            type="button"
            onClick={() => dismissNotification(n.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastList;
