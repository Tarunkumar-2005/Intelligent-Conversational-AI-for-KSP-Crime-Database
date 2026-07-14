import React, { useState, useRef, useEffect } from 'react';

/**
 * Reusable Premium Button Primitive
 */
export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold tracking-wide rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 focus:ring-cyan-500 border border-transparent shadow-md shadow-cyan-500/10 dark:from-cyan-600 dark:to-blue-600 dark:hover:from-cyan-500 dark:hover:to-blue-500 focus:ring-offset-slate-900',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-500 border border-transparent dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-offset-slate-900',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 focus:ring-red-500 border border-transparent shadow-md shadow-red-500/10 dark:focus:ring-offset-slate-900',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-cyan-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs uppercase tracking-wider',
    lg: 'px-6 py-3.5 text-sm uppercase tracking-widest',
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={`
        ${baseStyle} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${isBtnDisabled ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}
      `}
      disabled={isBtnDisabled}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

/**
 * Reusable Form Input Primitive
 */
export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon,
  className = '',
  disabled = false,
  id,
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full rounded px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none border
            ${icon ? 'pl-10' : ''}
            ${disabled ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-[#070e1b] dark:text-slate-600 dark:border-slate-800' : 'bg-white text-slate-800 border-slate-300 focus:border-blue-500 hover:border-slate-400 dark:bg-[#08101f] dark:text-slate-200 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-cyan-500/60'}
            ${error ? 'border-red-500 dark:border-red-500/50 focus:border-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>}
    </div>
  );
};

/**
 * Reusable Badge Primitive
 */
export const Badge = ({
  children,
  variant = 'default', // 'default' | 'success' | 'danger' | 'warning' | 'info'
  className = '',
}) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/50',
    success: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400 dark:bg-green-950/20 dark:border-green-500/10',
    danger: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400 dark:bg-red-950/20 dark:border-red-500/10',
    warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-500/10',
    info: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400 dark:bg-cyan-950/20 dark:border-cyan-500/10',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Reusable Dropdown Primitive
 */
export const Dropdown = ({
  trigger,
  children,
  align = 'right', // 'left' | 'right'
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute mt-2 w-48 rounded shadow-xl border z-50 overflow-hidden py-1 animate-[fadeIn_0.15s_ease-out]
            bg-white border-slate-200 text-slate-800 dark:bg-[#0b172a] dark:border-slate-800 dark:text-slate-200
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className = '', ...props }) => {
  return (
    <button
      type="button"
      className={`
        w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-150 flex items-center gap-2.5
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Reusable Borderless Table primitives
 */
export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto">
    <table className={`w-full text-left border-collapse ${className}`}>{children}</table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150 ${className}`}>
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 align-middle ${className}`}>{children}</td>
);

export const TableHeaderCell = ({ children, className = '' }) => (
  <th className={`px-6 py-3 font-semibold ${className}`}>{children}</th>
);
