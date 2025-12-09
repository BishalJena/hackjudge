/**
 * TerminalCard - Bordered box component mimicking terminal windows
 */
'use client';

import React from 'react';

interface TerminalCardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    variant?: 'default' | 'highlight' | 'success' | 'error';
}

export function TerminalCard({
    children,
    title,
    className = '',
    variant = 'default'
}: TerminalCardProps) {
    const variantStyles = {
        default: 'border-[var(--color-border)]',
        highlight: 'border-[var(--color-text-primary)]',
        success: 'border-[var(--color-accent-success)]',
        error: 'border-[var(--color-accent-error)]',
    };

    return (
        <div
            className={`
        border-2 
        ${variantStyles[variant]}
        bg-[var(--color-bg-secondary)] 
        p-4 md:p-6 
        transition-all duration-200
        hover:border-[var(--color-border-hover)]
        ${className}
      `}
        >
            {title && (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[var(--color-text-primary)]">&gt;</span>
                        <h3 className="text-[var(--color-text-primary)] font-bold uppercase tracking-wider text-sm">
                            {title}
                        </h3>
                    </div>
                    <div className="border-t border-[var(--color-border)] mb-4" />
                </>
            )}
            {children}
        </div>
    );
}

/**
 * TerminalBox - ASCII-styled box with corner characters
 */
interface TerminalBoxProps {
    children: React.ReactNode;
    className?: string;
}

export function TerminalBox({ children, className = '' }: TerminalBoxProps) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute top-0 left-0 text-[var(--color-border)]">┌</div>
            <div className="absolute top-0 right-0 text-[var(--color-border)]">┐</div>
            <div className="absolute bottom-0 left-0 text-[var(--color-border)]">└</div>
            <div className="absolute bottom-0 right-0 text-[var(--color-border)]">┘</div>
            <div className="border border-[var(--color-border)] p-4 m-2">
                {children}
            </div>
        </div>
    );
}
