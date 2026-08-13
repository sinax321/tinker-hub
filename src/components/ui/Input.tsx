import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-base text-white placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-500 focus:ring-rose-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 ml-1 text-sm text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
