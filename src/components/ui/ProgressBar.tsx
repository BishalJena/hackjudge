/**
 * ProgressBar - ASCII-styled progress bar using █ and ░
 */
'use client';

import React from 'react';

interface ProgressBarProps {
    value: number;           // 0-100
    max?: number;
    label?: string;
    showPercentage?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'error';
    className?: string;
}

export function ProgressBar({
    value,
    max = 100,
    label,
    showPercentage = true,
    size = 'md',
    variant = 'default',
    className = '',
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeConfig = {
        sm: { blocks: 10, fontSize: 'text-xs' },
        md: { blocks: 16, fontSize: 'text-sm' },
        lg: { blocks: 20, fontSize: 'text-base' },
    };

    const variantColors = {
        default: 'text-[var(--color-accent-success)]',
        success: 'text-[var(--color-accent-success)]',
        warning: 'text-[var(--color-accent-warning)]',
        error: 'text-[var(--color-accent-error)]',
    };

    const { blocks, fontSize } = sizeConfig[size];
    const filledBlocks = Math.round((percentage / 100) * blocks);
    const emptyBlocks = blocks - filledBlocks;

    return (
        <div className={`flex items-center gap-3 ${fontSize} ${className}`}>
            {label && (
                <span className="text-[var(--color-text-secondary)] min-w-[120px] truncate">
                    {label}
                </span>
            )}

            <div className="flex items-center gap-2">
                {showPercentage && (
                    <span className="text-[var(--color-text-primary)] min-w-[50px] text-right">
                        {Math.round(value)}/{max}
                    </span>
                )}

                <span className="font-mono tracking-tight">
                    <span className={variantColors[variant]}>
                        {'█'.repeat(filledBlocks)}
                    </span>
                    <span className="text-[var(--color-text-dim)]">
                        {'░'.repeat(emptyBlocks)}
                    </span>
                </span>
            </div>
        </div>
    );
}

/**
 * StepProgress - Progress indicator for multi-step processes
 */
interface Step {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
}

interface StepProgressProps {
    steps: Step[];
    currentStep?: number;
    className?: string;
}

export function StepProgress({ steps, currentStep, className = '' }: StepProgressProps) {
    const getStatusIcon = (status: Step['status']) => {
        switch (status) {
            case 'complete': return <span className="text-[var(--color-accent-success)]">✓</span>;
            case 'failed': return <span className="text-[var(--color-accent-error)]">✗</span>;
            case 'running': return <span className="text-[var(--color-accent-warning)] animate-pulse">⋯</span>;
            default: return <span className="text-[var(--color-text-dim)]">○</span>;
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {steps.map((step, index) => (
                <div
                    key={step.id}
                    className={`flex items-center gap-3 ${step.status === 'running' ? 'text-[var(--color-text-primary)]' :
                            step.status === 'complete' ? 'text-[var(--color-text-secondary)]' :
                                'text-[var(--color-text-dim)]'
                        }`}
                >
                    <span className="w-6 text-center">[{getStatusIcon(step.status)}]</span>
                    <span>{step.name}</span>
                    {step.status === 'running' && (
                        <span className="text-[var(--color-text-dim)] text-sm ml-auto">
                            ({currentStep !== undefined ? `${index + 1} of ${steps.length}` : ''})
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * LoadingBar - Animated loading progress bar
 */
interface LoadingBarProps {
    progress?: number;       // 0-100, undefined for indeterminate
    className?: string;
}

export function LoadingBar({ progress, className = '' }: LoadingBarProps) {
    if (progress !== undefined) {
        const blocks = 20;
        const filled = Math.round((progress / 100) * blocks);
        return (
            <div className={`font-mono ${className}`}>
                <span className="text-[var(--color-text-dim)]">[</span>
                <span className="text-[var(--color-accent-success)]">{'█'.repeat(filled)}</span>
                <span className="text-[var(--color-text-dim)]">{'░'.repeat(blocks - filled)}</span>
                <span className="text-[var(--color-text-dim)]">]</span>
                <span className="text-[var(--color-text-secondary)] ml-2">{Math.round(progress)}%</span>
            </div>
        );
    }

    // Indeterminate loading animation
    return (
        <div className={`font-mono flex items-center gap-2 ${className}`}>
            <span className="text-[var(--color-text-primary)]">Loading</span>
            <span className="animate-pulse text-[var(--color-text-primary)]">...</span>
        </div>
    );
}
