import React from 'react';

const base = {
  primary: { background: '#2563eb', color: '#fff' },
  ghost: { background: '#e2e8f0', color: '#0f172a' },
};

export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled }) {
  const style = base[variant] || base.primary;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...style,
        border: 'none',
        padding: '10px 14px',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.65 : 1,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
