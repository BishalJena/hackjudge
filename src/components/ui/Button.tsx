/**
 * Button - Terminal-styled button with hover glow
 */
'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export function Button({
    variant = 'default',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = `
    font-mono uppercase tracking-wider
    border-2 transition-all duration-200
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const variantStyles = {
        default: `
      bg-transparent text-[var(--color-text-primary)]
      border-[var(--color-border)]
      hover:border-[var(--color-text-primary)]
      hover:shadow-[0_0_15px_var(--color-hover-glow)]
    `,
        primary: `
      bg-[var(--color-text-primary)] text-[var(--color-bg)]
      border-[var(--color-text-primary)]
      hover:bg-transparent hover:text-[var(--color-text-primary)]
      hover:shadow-[0_0_15px_var(--color-hover-glow)]
    `,
        success: `
      bg-transparent text-[var(--color-accent-success)]
      border-[var(--color-accent-success)]
      hover:shadow-[0_0_15px_var(--color-success-glow)]
    `,
        warning: `
      bg-transparent text-[var(--color-accent-warning)]
      border-[var(--color-accent-warning)]
      hover:shadow-[0_0_10px_rgba(255,221,0,0.4)]
    `,
        error: `
      bg-transparent text-[var(--color-accent-error)]
      border-[var(--color-accent-error)]
      hover:shadow-[0_0_15px_var(--color-error-glow)]
    `,
        ghost: `
      bg-transparent text-[var(--color-text-primary)]
      border-transparent
      hover:border-[var(--color-border)]
    `,
    };

    return (
        <button
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="animate-spin">⟳</span>
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    {icon}
                    {children}
                    {variant !== 'ghost' && <span className="ml-1">&gt;</span>}
                </>
            )}
        </button>
    );
}

/**
 * IconButton - Compact button for actions
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    label?: string;
}

export function IconButton({ icon, label, className = '', ...props }: IconButtonProps) {
    return (
        <button
            className={`
        p-2 text-[var(--color-text-secondary)]
        hover:text-[var(--color-text-primary)]
        hover:shadow-[0_0_10px_var(--color-hover-glow)]
        transition-all duration-200
        ${className}
      `}
            aria-label={label}
            {...props}
        >
            {icon}
        </button>
    );
}
