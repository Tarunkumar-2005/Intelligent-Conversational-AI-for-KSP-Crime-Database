import React from 'react';

const EmptyConversation = ({ onPromptClick }) => {
  const suggestions = [
    { text: 'Show robbery cases in Bengaluru', label: 'Robbery Map' },
    { text: 'Find repeat offenders', label: 'Offenders Dossier' },
    { text: 'Show cyber crimes in Mysuru', label: 'Cyber Scams' },
    { text: 'Generate crime summary', label: 'Analytics Summary' }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none max-w-lg mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
      {/* Central Shield Icon */}
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-500 mb-6 dark:bg-cyan-500/5 dark:border-cyan-500/20 dark:text-cyan-400">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 font-display">
        KSP Intelligence Assistant
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
        Query the active criminal directories, vehicle logs, banking transactions, and gang relationships. Enter queries in English or Kannada.
      </p>

      {/* Suggested Prompts List */}
      <div className="w-full space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-left mb-1">
          Suggested Inquiries
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onPromptClick(s.text)}
              className="p-3 text-left rounded border text-xs bg-slate-50 border-slate-200 hover:border-blue-500 dark:bg-slate-900/30 dark:border-slate-800 dark:hover:border-cyan-400/50 transition-all duration-150 flex flex-col justify-between"
            >
              <span className="font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                "{s.text}"
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2 block">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyConversation;
