import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-400 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3
              ${icon ? 'pl-12' : ''}
              text-silver placeholder:text-slate-500 outline-none
              focus:border-gold/50 focus:ring-1 focus:ring-gold/20
              transition-all group-hover:border-white/20
              ${error ? 'border-red-500/50 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
