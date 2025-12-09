/**
 * Separator - ASCII line separator components
 */
'use client';

import React from 'react';

interface SeparatorProps {
    variant?: 'single' | 'double' | 'dashed' | 'equals';
    className?: string;
    label?: string;
}

export function Separator({ variant = 'single', className = '', label }: SeparatorProps) {
    if (label) {
        return (
            <div className={`flex items-center gap-4 my-6 ${className}`}>
                <div className="flex-1 border-t border-[var(--color-border)]" />
                <span className="text-[var(--color-text-secondary)] text-sm uppercase tracking-wider">
                    {label}
                </span>
                <div className="flex-1 border-t border-[var(--color-border)]" />
            </div>
        );
    }

    const variantStyles = {
        single: 'border-t border-[var(--color-border)]',
        double: 'border-t-2 border-double border-[var(--color-border)]',
        dashed: 'border-t border-dashed border-[var(--color-border)]',
        equals: '',
    };

    if (variant === 'equals') {
        return (
            <div className={`my-6 text-[var(--color-border)] font-mono overflow-hidden ${className}`}>
                ════════════════════════════════════════════════════════════════════════════════
            </div>
        );
    }

    return <hr className={`my-6 ${variantStyles[variant]} ${className}`} />;
}

/**
 * SectionHeader - Section title with separator
 */
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export function SectionHeader({ title, subtitle, className = '' }: SectionHeaderProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <div className="border-t border-[var(--color-border)]" />
            <h3 className="text-[var(--color-text-primary)] font-bold uppercase tracking-wider">
                {title}
            </h3>
            {subtitle && (
                <p className="text-[var(--color-text-secondary)] text-sm">{subtitle}</p>
            )}
            <div className="border-t border-[var(--color-border)]" />
        </div>
    );
}

/**
 * CodeBlock - Monospace code display
 */
interface CodeBlockProps {
    children: React.ReactNode;
    title?: string;
    language?: string;
    className?: string;
}

export function CodeBlock({ children, title, language, className = '' }: CodeBlockProps) {
    return (
        <div className={`border border-[var(--color-border)] ${className}`}>
            {(title || language) && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                    {title && (
                        <span className="text-[var(--color-text-secondary)] text-sm">{title}</span>
                    )}
                    {language && (
                        <span className="text-[var(--color-text-dim)] text-xs uppercase">{language}</span>
                    )}
                </div>
            )}
            <pre className="p-4 overflow-x-auto bg-[var(--color-bg-secondary)]">
                <code className="text-[var(--color-text-primary)] text-sm font-mono">
                    {children}
                </code>
            </pre>
        </div>
    );
}

/**
 * BulletList - Terminal-styled bullet list
 */
interface BulletListProps {
    items: string[];
    variant?: 'default' | 'success' | 'warning' | 'error';
    className?: string;
}

export function BulletList({ items, variant = 'default', className = '' }: BulletListProps) {
    const bulletStyles = {
        default: 'text-[var(--color-text-primary)]',
        success: 'text-[var(--color-accent-success)]',
        warning: 'text-[var(--color-accent-warning)]',
        error: 'text-[var(--color-accent-error)]',
    };

    return (
        <ul className={`space-y-2 ${className}`}>
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                    <span className={bulletStyles[variant]}>&gt;</span>
                    <span className="text-[var(--color-text-secondary)]">{item}</span>
                </li>
            ))}
        </ul>
    );
}
