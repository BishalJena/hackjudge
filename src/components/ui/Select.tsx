/**
 * Select - Text-based dropdown component
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    options: Option[];
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    className?: string;
}

export function Select({
    options,
    value,
    onChange,
    label,
    placeholder = 'Select...',
    error,
    className = '',
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`space-y-2 ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-[var(--color-text-secondary)] text-sm uppercase tracking-wider">
                    <span className="text-[var(--color-text-primary)]">&gt;</span> {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
            w-full font-mono text-left
            bg-transparent text-[var(--color-text-primary)]
            border-2 border-[var(--color-border)]
            px-4 py-3
            focus:border-[var(--color-text-primary)]
            focus:shadow-[0_0_10px_var(--color-hover-glow)]
            focus:outline-none
            transition-all duration-200
            flex items-center justify-between
            ${error ? 'border-[var(--color-accent-error)]' : ''}
          `}
                >
                    <span className={selectedOption ? '' : 'text-[var(--color-text-dim)]'}>
                        {selectedOption?.label || placeholder}
                    </span>
                    <span className="text-[var(--color-text-secondary)]">
                        {isOpen ? '▲' : '▼'}
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-[var(--color-bg)] border-2 border-[var(--color-border)] max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`
                  w-full text-left px-4 py-2 font-mono
                  hover:bg-[var(--color-bg-secondary)]
                  hover:text-[var(--color-text-primary)]
                  transition-colors duration-150
                  ${option.value === value
                                        ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)]'
                                        : 'text-[var(--color-text-secondary)]'
                                    }
                `}
                            >
                                <span className="mr-2">{option.value === value ? '>' : ' '}</span>
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-[var(--color-accent-error)] text-xs">
                    <span>ERROR:</span> {error}
                </p>
            )}
        </div>
    );
}

/**
 * Toggle - Terminal-styled toggle switch
 */
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    className?: string;
}

export function Toggle({ checked, onChange, label, className = '' }: ToggleProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`
        flex items-center gap-3 font-mono
        text-[var(--color-text-secondary)]
        hover:text-[var(--color-text-primary)]
        transition-colors duration-200
        ${className}
      `}
        >
            <span className={`
        px-2 py-0.5 border transition-all duration-200
        ${checked
                    ? 'border-[var(--color-accent-success)] text-[var(--color-accent-success)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                }
      `}>
                {checked ? '[ON]' : '[OFF]'}
            </span>
            <span>{label}</span>
        </button>
    );
}
