import React from 'react';
import { Badge, Button } from '../UIPrimitives.jsx';

const ChatHeader = ({ title, onExport, onClearActive }) => {
  return (
    <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b1329]/40 flex items-center justify-between gap-4 select-none shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shrink-0"></span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
          {title || 'Empty Dossier Query'}
        </h3>
        <Badge variant="info">AI Offline Mode</Badge>
      </div>

      <div className="flex items-center gap-3">
        {onClearActive && (
          <button
            type="button"
            onClick={onClearActive}
            className="p-2 text-slate-400 hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
            title="Wipe Active Thread History"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        <Button variant="outline" size="sm" onClick={onExport}>
          <svg className="w-3.5 h-3.5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export File
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
