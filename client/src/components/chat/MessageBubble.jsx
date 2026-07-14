import React from 'react';
import { Badge, Button } from '../UIPrimitives.jsx';
import { downloadChatPDF, downloadInvestigationPDF, downloadAnalyticsPDF } from '../../utils/pdfGenerator.js';

const MessageBubble = ({ message, onCopy, onRegenerate, isLast }) => {
  const isUser = message.sender === 'user';

  const showChatBtn = message.text.includes('DOWNLOAD_CHAT_PDF');
  const showInvBtn = message.text.includes('DOWNLOAD_INVESTIGATION_PDF');
  const showAnlBtn = message.text.includes('DOWNLOAD_ANALYTICS_PDF');

  // Strip action trigger text from user display message
  const displayText = message.text
    .replace('DOWNLOAD_CHAT_PDF', '')
    .replace('DOWNLOAD_INVESTIGATION_PDF', '')
    .replace('DOWNLOAD_ANALYTICS_PDF', '')
    .trim();

  return (
    <div className={`flex w-full select-text ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xl rounded-lg p-4 text-xs leading-relaxed border flex flex-col gap-1.5
        ${isUser 
          ? 'bg-blue-600 border-transparent text-white dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-200' 
          : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-900/40 dark:border-slate-800/60 dark:text-slate-200'}
      `}>
        {/* Header Metadata */}
        <div className="flex justify-between items-center gap-6 text-[9px] font-bold uppercase tracking-wider opacity-60">
          <div className="flex items-center gap-1.5">
            <span>{isUser ? 'Officer Context' : 'AI Detective Agent'}</span>
            {!isUser && <Badge variant="default">Cited</Badge>}
          </div>
          <span>{message.timestamp}</span>
        </div>

        {/* Message body content */}
        <div className="whitespace-pre-line font-medium text-slate-800 dark:text-slate-200 select-text">
          {displayText}
        </div>

        {/* Intercept PDF trigger download buttons */}
        {(showChatBtn || showInvBtn || showAnlBtn) && (
          <div className="mt-2.5 p-3 rounded bg-blue-500/10 border border-blue-500/20 dark:bg-cyan-500/5 dark:border-cyan-500/15 flex flex-col gap-2">
            <p className="font-bold text-slate-700 dark:text-slate-300 text-[9px] uppercase tracking-wider">Export Document Ready</p>
            {showChatBtn && (
              <Button size="sm" onClick={() => downloadChatPDF('Chat Conversation Export', [{ sender: 'user', content: 'Chat conversation exported' }])} className="text-[10px] py-1.5 w-fit">
                Download Chat Transcript PDF
              </Button>
            )}
            {showInvBtn && (
              <Button size="sm" onClick={() => downloadInvestigationPDF('FIR-KSP-MYS-01-2024')} className="text-[10px] py-1.5 w-fit">
                Download Case Dossier PDF
              </Button>
            )}
            {showAnlBtn && (
              <Button size="sm" onClick={() => downloadAnalyticsPDF('All Districts')} className="text-[10px] py-1.5 w-fit">
                Download Analytics summary PDF
              </Button>
            )}
          </div>
        )}

        {/* Message Action Utilities */}
        {!isUser && (
          <div className="flex items-center gap-3 border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5 mt-1 select-none">
            {/* Copy Button */}
            <button
              type="button"
              onClick={() => onCopy(message.text)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-cyan-400 transition-colors"
              title="Copy dossier log to clipboard"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h6m-6 4h6m2 5H7" />
              </svg>
              Copy Log
            </button>

            {/* Speak Response Button */}
            <button
              type="button"
              onClick={() => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(displayText);
                  // Kannada unicode characters range check
                  if (displayText.match(/[\u0c80-\u0cff]/)) {
                    utterance.lang = 'kn-IN';
                  } else {
                    utterance.lang = 'en-IN';
                  }
                  window.speechSynthesis.speak(utterance);
                }
              }}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-cyan-400 transition-colors"
              title="Read response aloud"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Speak
            </button>

            {/* Regenerate Button (For AI responses) */}
            {isLast && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-cyan-400 transition-colors"
                title="Recalculate AI analysis models"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                </svg>
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
