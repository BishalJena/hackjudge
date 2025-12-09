/**
 * Input - Terminal-styled input field with focus glow
 */
'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, prefix, className = '', ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-[var(--color-text-secondary)] text-sm uppercase tracking-wider">
                        <span className="text-[var(--color-text-primary)]">&gt;</span> {label}
                    </label>
                )}

                <div className="relative">
                    {prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]">
                            {prefix}
                        </span>
                    )}

                    <input
                        ref={ref}
                        className={`
              w-full font-mono
              bg-transparent text-[var(--color-text-primary)]
              border-2 border-[var(--color-border)]
              px-4 py-3
              placeholder:text-[var(--color-text-dim)]
              focus:border-[var(--color-text-primary)]
              focus:shadow-[0_0_10px_var(--color-hover-glow)]
              focus:outline-none
              transition-all duration-200
              ${prefix ? 'pl-8' : ''}
              ${error ? 'border-[var(--color-accent-error)]' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>

                {hint && !error && (
                    <p className="text-[var(--color-text-dim)] text-xs">
                        <span className="text-[var(--color-text-secondary)]">?</span> {hint}
                    </p>
                )}

                {error && (
                    <p className="text-[var(--color-accent-error)] text-xs">
                        <span>ERROR:</span> {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

/**
 * TextArea - Terminal-styled textarea
 */
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-[var(--color-text-secondary)] text-sm uppercase tracking-wider">
                        <span className="text-[var(--color-text-primary)]">&gt;</span> {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    className={`
            w-full font-mono min-h-[100px] resize-y
            bg-transparent text-[var(--color-text-primary)]
            border-2 border-[var(--color-border)]
            px-4 py-3
            placeholder:text-[var(--color-text-dim)]
            focus:border-[var(--color-text-primary)]
            focus:shadow-[0_0_10px_var(--color-hover-glow)]
            focus:outline-none
            transition-all duration-200
            ${error ? 'border-[var(--color-accent-error)]' : ''}
            ${className}
          `}
                    {...props}
                />

                {error && (
                    <p className="text-[var(--color-accent-error)] text-xs">
                        <span>ERROR:</span> {error}
                    </p>
                )}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';
