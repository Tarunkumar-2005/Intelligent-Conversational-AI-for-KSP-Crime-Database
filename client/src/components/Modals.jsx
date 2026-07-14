import React, { useEffect } from 'react';
import { Button } from './UIPrimitives.jsx';

/**
 * Reusable modal overlay component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  actions,
}) => {
  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`
        w-full bg-white dark:bg-[#0b172a] border border-slate-200 dark:border-slate-800 rounded shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-[scaleIn_0.2s_ease-out]
        ${sizes[size]}
      `}>
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {title}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {children}
        </div>

        {/* Modal Footer */}
        {actions && (
          <div className="h-16 px-6 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end gap-3 bg-slate-50 dark:bg-[#09101f]/50">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Reusable Confirmation dialog popup
 */
export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'primary'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {variant === 'danger' && (
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )}
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pt-1">
          {message}
        </p>
      </div>
    </Modal>
  );
};
