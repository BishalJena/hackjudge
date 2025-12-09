/**
 * ExpansionCard - Collapsible card with expand/collapse
 */
'use client';

import React, { useState } from 'react';

interface ExpansionCardProps {
    title: string;
    defaultExpanded?: boolean;
    children: React.ReactNode;
    badge?: string | number;
    variant?: 'default' | 'success' | 'warning' | 'error';
    className?: string;
}

export function ExpansionCard({
    title,
    defaultExpanded = false,
    children,
    badge,
    variant = 'default',
    className = '',
}: ExpansionCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const variantStyles = {
        default: 'border-[var(--color-border)]',
        success: 'border-[var(--color-accent-success)]',
        warning: 'border-[var(--color-accent-warning)]',
        error: 'border-[var(--color-accent-error)]',
    };

    const variantTextStyles = {
        default: 'text-[var(--color-text-primary)]',
        success: 'text-[var(--color-accent-success)]',
        warning: 'text-[var(--color-accent-warning)]',
        error: 'text-[var(--color-accent-error)]',
    };

    return (
        <div
            className={`
        border-2 ${variantStyles[variant]}
        bg-[var(--color-bg-secondary)]
        transition-all duration-200
        ${className}
      `}
        >
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
          w-full flex items-center justify-between
          px-4 py-3
          hover:bg-[var(--color-bg)]
          transition-colors duration-200
        `}
            >
                <div className="flex items-center gap-3">
                    <span className={`${variantTextStyles[variant]}`}>
                        {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className={`font-bold uppercase tracking-wider text-sm ${variantTextStyles[variant]}`}>
                        {title}
                    </span>
                    {badge !== undefined && (
                        <span className="px-2 py-0.5 text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                            {badge}
                        </span>
                    )}
                </div>
                <span className="text-[var(--color-text-dim)] text-sm">
                    [{isExpanded ? 'COLLAPSE' : 'EXPAND'}]
                </span>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)]">
                    {children}
                </div>
            )}
        </div>
    );
}

/**
 * ActionCard - Card with action buttons
 */
interface Action {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary';
}

interface ActionCardProps {
    title: string;
    description?: string;
    actions: Action[];
    className?: string;
}

export function ActionCard({ title, description, actions, className = '' }: ActionCardProps) {
    return (
        <div className={`border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 ${className}`}>
            <h4 className="text-[var(--color-text-primary)] font-bold uppercase tracking-wider mb-2">
                {title}
            </h4>
            {description && (
                <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                    {description}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`
              font-mono text-sm px-3 py-1.5
              border transition-all duration-200
              ${action.variant === 'primary'
                                ? 'border-[var(--color-text-primary)] text-[var(--color-text-primary)] hover:shadow-[0_0_10px_var(--color-hover-glow)]'
                                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]'
                            }
            `}
                    >
                        &gt; [{action.label}]
                    </button>
                ))}
            </div>
        </div>
    );
}
