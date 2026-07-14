import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

const ChatInput = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef(null);
  const { language } = useLanguage();
  const [listening, setListening] = useState(false);

  // Auto-resize textarea heights dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  // Focus input automatically on mount
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleMicToggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser.');
      return;
    }
    
    if (listening) {
      if (window.recognitionInstance) {
        window.recognitionInstance.stop();
      }
      setListening(false);
      return;
    }
    
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = language === 'en' ? 'en-IN' : 'kn-IN';
    
    rec.onstart = () => {
      setListening(true);
    };
    
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange(value ? `${value} ${transcript}` : transcript);
      setListening(false);
    };
    
    rec.onerror = () => {
      setListening(false);
    };
    
    rec.onend = () => {
      setListening(false);
    };
    
    window.recognitionInstance = rec;
    rec.start();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#09101f]/30 flex items-end gap-3 select-none">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          rows="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question (e.g. Show cyber crimes in Mysuru)..."
          disabled={disabled}
          className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg pl-4 pr-10 py-3 text-xs leading-relaxed focus:outline-none focus:border-blue-500 hover:border-slate-400 dark:bg-[#08101f] dark:text-slate-200 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-cyan-500/60 resize-none max-h-40 min-h-[46px] block transition-colors duration-150"
          aria-label="Investigative query text input box"
        />
        {/* Voice Input Mic Toggle Button */}
        <button
          type="button"
          onClick={handleMicToggle}
          disabled={disabled}
          className={`absolute right-3.5 top-3.5 text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors ${listening ? 'animate-pulse text-red-500 hover:text-red-600' : ''}`}
          title="Toggle Voice Input"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="h-[46px] px-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
        aria-label="Submit query to AI agent"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
