import React, { useState } from 'react';

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAll,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditStart = (id, currentTitle) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleEditSave = (id, onRename) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full select-none dark:bg-[#0b1329] dark:border-slate-800/80">
      <div className="flex flex-col flex-1 min-h-0">
        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-800 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-cyan-500/10"
            aria-label="Initialize New Conversation Thread"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Investigation
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar">
          <p className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Active Dossier Threads
          </p>

          {conversations.length === 0 ? (
            <p className="px-3 py-4 text-xs font-semibold text-slate-500 italic">No historical queries.</p>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeConversationId;
              const isEditing = c.id === editingId;

              return (
                <div
                  key={c.id}
                  className={`
                    group flex items-center justify-between rounded px-3 py-2.5 text-xs font-semibold tracking-wide transition-all border-l-2 duration-150 relative
                    ${isActive
                      ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:bg-cyan-500/10 dark:border-cyan-400 dark:text-cyan-400'
                      : 'border-transparent text-slate-400 hover:bg-slate-800/40 dark:hover:bg-slate-800/20 hover:text-slate-200'}
                  `}
                >
                  <div 
                    className="flex-1 min-w-0 pr-6 cursor-pointer flex items-center gap-2"
                    onClick={() => !isEditing && onSelectConversation(c.id)}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleEditSave(c.id, c.onRename || ((id, val) => c.title = val))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave(c.id, c.onRename || ((id, val) => c.title = val));
                        }}
                        className="bg-transparent border-b border-blue-500 focus:outline-none w-full text-slate-100 text-xs"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate">{c.title}</span>
                    )}
                  </div>

                  {/* Actions (Rename / Delete) */}
                  {!isEditing && (
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
                      <button
                        type="button"
                        onClick={() => handleEditStart(c.id, c.title)}
                        className="p-1 text-slate-500 hover:text-slate-200 rounded"
                        title="Rename Thread"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteConversation(c.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded"
                        title="Delete Thread"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clear all footer actions */}
      {conversations.length > 0 && (
        <div className="p-4 border-t border-slate-800 dark:border-slate-800/60 bg-slate-950/20">
          <button
            type="button"
            onClick={onClearAll}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/30 rounded text-[10px] font-bold uppercase tracking-wider transition-colors duration-150"
            aria-label="Clear All Conversation Histories"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Archive
          </button>
        </div>
      )}
    </aside>
  );
};

export default ChatSidebar;
