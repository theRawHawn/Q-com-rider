import React from 'react';

export type BadgeVariant =
  | 'brand'
  | 'orange'
  | 'emerald'
  | 'indigo'
  | 'amber'
  | 'rose'
  | 'neutral'
  | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantMap = {
    brand: 'bg-[#EBF7FD] text-[#009DE0] border-[#009DE0]/30',
    orange: 'bg-[#EBF7FD] text-[#009DE0] border-[#009DE0]/30',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
  };

  const dotColorMap = {
    brand: 'bg-[#009DE0]',
    orange: 'bg-[#009DE0]',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    neutral: 'bg-neutral-500',
    blue: 'bg-sky-500',
  };

  const sizeMap = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-tight ${variantMap[variant]} ${sizeMap[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[variant]}`} />}
      {children}
    </span>
  );
};
