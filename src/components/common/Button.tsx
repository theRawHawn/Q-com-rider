import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const sizeClasses = {
    sm: 'h-9 px-3.5 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-13 px-6 text-base gap-2.5',
  };

  const variantClasses = {
    brand:
      'bg-[#f25100] text-white hover:bg-[#d94800] focus:ring-[#f25100] shadow-2xs border border-[#f25100]',
    primary:
      'bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-900 shadow-sm border border-neutral-900',
    secondary:
      'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus:ring-neutral-400 border border-neutral-200/80',
    outline:
      'bg-transparent text-neutral-800 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-400',
    ghost:
      'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-400',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-sm border border-rose-600',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 shadow-sm border border-emerald-600',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
