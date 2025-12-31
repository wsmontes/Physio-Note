import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ 
  className, 
  type = 'text',
  label,
  error,
  errorMessage,
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
          'placeholder:text-gray-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
          error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:ring-blue-600',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        ref={ref}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
