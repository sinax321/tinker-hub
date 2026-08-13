import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'appearance-none flex h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 pr-10 text-base text-white placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-rose-500 focus:ring-rose-500',
              className
            )}
            ref={ref}
            {...props}
          >
            <option value="" disabled>Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1.5 ml-1 text-sm text-rose-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
