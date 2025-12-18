import React from 'react';

export default function Radio({ checked, onChange, name, label, className = '', labelClassName = '' }) {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        name={name}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${checked ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-white/20'}`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>
      <span className={labelClassName} title={label}>{label}</span>
    </label>
  );
}
