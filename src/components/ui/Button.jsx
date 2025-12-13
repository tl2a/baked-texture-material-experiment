import React from 'react';

export default function Button({ children, className = '', variant = 'default', size = 'md', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full font-medium transition-colors transform-gpu active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap gap-2';
  const variants = {
    default: 'bg-white/6 text-white hover:bg-white/10 focus-visible:ring-white/20',
    primary: 'bg-indigo-500 text-white hover:bg-indigo-600 focus-visible:ring-indigo-400',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/6 focus-visible:ring-white/10',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  const cls = [base, variants[variant] || variants.default, sizes[size] || sizes.md, className].join(' ');
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
