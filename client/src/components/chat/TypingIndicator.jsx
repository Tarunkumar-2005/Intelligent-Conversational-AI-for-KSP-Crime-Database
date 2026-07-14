import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start w-full">
      <div className="bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/60 p-4 rounded-lg flex items-center gap-3 text-xs text-slate-400 max-w-sm">
        {/* Pulsing indicator dots */}
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Analyzing regional records...
        </p>
      </div>
    </div>
  );
};

export default TypingIndicator;
