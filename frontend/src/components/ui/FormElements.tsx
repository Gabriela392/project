'use client';
import React from 'react';

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, error, required, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 5, fontSize: 14, fontWeight: 500 }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      {children}
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc3545' }}>{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, style, ...props }: InputProps) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '9px 12px',
        border: `1px solid ${error ? '#dc3545' : '#ced4da'}`,
        borderRadius: 4, fontSize: 14, boxSizing: 'border-box',
        outline: 'none',
        ...style,
      }}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, children, style, ...props }: SelectProps) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '9px 12px',
        border: `1px solid ${error ? '#dc3545' : '#ced4da'}`,
        borderRadius: 4, fontSize: 14, boxSizing: 'border-box',
        background: '#fff',
        ...style,
      }}
    >
      {children}
    </select>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextArea({ error, style, ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%', padding: '9px 12px',
        border: `1px solid ${error ? '#dc3545' : '#ced4da'}`,
        borderRadius: 4, fontSize: 14, boxSizing: 'border-box',
        resize: 'vertical', minHeight: 80,
        ...style,
      }}
    />
  );
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export function Btn({ variant = 'primary', loading, children, style, disabled, ...props }: BtnProps) {
  const colors = {
    primary: { bg: '#1351B4', color: '#fff', border: '#1351B4' },
    secondary: { bg: '#f8f9fa', color: '#212529', border: '#ced4da' },
    danger: { bg: '#dc3545', color: '#fff', border: '#dc3545' },
  };
  const c = colors[variant];
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        padding: '9px 18px', background: c.bg, color: c.color,
        border: `1px solid ${c.border}`, borderRadius: 4,
        fontSize: 14, fontWeight: 500, cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.7 : 1,
        ...style,
      }}
    >
      {loading ? 'Aguarde...' : children}
    </button>
  );
}
