import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  noPadding = false,
  hover = false
}) => {
  return (
    <div 
      className={`
        bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40
        ${hover ? 'transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-600/10' : ''}
        ${noPadding ? '' : 'p-6 md:p-8'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};