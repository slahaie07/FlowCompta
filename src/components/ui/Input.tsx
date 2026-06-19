import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const inputId = idProp || autoId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-400 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-noir/80 border border-white/10 rounded-2xl px-4 py-3
              ${icon ? 'pl-12' : ''}
              text-ivoire placeholder:text-slate-500 outline-none
              focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20
              transition-all group-hover:border-white/20
              ${error ? 'border-red-500/50 focus-visible:border-red-500' : ''}
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
