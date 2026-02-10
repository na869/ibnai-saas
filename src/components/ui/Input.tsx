import React, { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-white text-slate-900 border-2 rounded-xl px-4 py-3
              placeholder:text-slate-400 font-medium transition-all duration-200
              focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10
              disabled:opacity-50 disabled:bg-slate-50
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 hover:border-slate-300'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 ml-1 text-sm font-medium text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';