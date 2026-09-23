import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-neutral-200/80 my-4">
      {icon && <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-600 mb-3">{icon}</div>}
      <h4 className="text-base font-bold text-neutral-900 tracking-tight">{title}</h4>
      <p className="text-sm text-neutral-500 max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
};
