/**
 * Modal - Full-screen modal for content display
 */
'use client';

import React, { useEffect, useCallback } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}: ModalProps) {
    const handleEscape = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    const sizeStyles = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[var(--color-bg)]/90 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`
          relative w-full ${sizeStyles[size]}
          bg-[var(--color-bg)] border-2 border-[var(--color-border)]
          flex flex-col max-h-[90vh]
          animate-in fade-in zoom-in-95 duration-200
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <h2 className="text-[var(--color-text-primary)] font-bold uppercase tracking-wider">
                        <span className="text-[var(--color-text-secondary)]">&gt;</span> {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="
              text-[var(--color-text-secondary)]
              hover:text-[var(--color-text-primary)]
              hover:shadow-[0_0_10px_var(--color-hover-glow)]
              transition-all duration-200
              p-1
            "
                    >
                        [ESC]
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-4 border-t border-[var(--color-border)]">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * ConfirmModal - Confirmation dialog
 */
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
}: ConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="
              font-mono text-sm px-4 py-2
              border border-[var(--color-border)]
              text-[var(--color-text-secondary)]
              hover:border-[var(--color-text-primary)]
              hover:text-[var(--color-text-primary)]
              transition-all duration-200
            "
                    >
                        [{cancelLabel}]
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`
              font-mono text-sm px-4 py-2
              border transition-all duration-200
              ${variant === 'danger'
                                ? 'border-[var(--color-accent-error)] text-[var(--color-accent-error)] hover:shadow-[0_0_10px_var(--color-error-glow)]'
                                : 'border-[var(--color-text-primary)] text-[var(--color-text-primary)] hover:shadow-[0_0_10px_var(--color-hover-glow)]'
                            }
            `}
                    >
                        [{confirmLabel}] &gt;
                    </button>
                </div>
            }
        >
            <p className="text-[var(--color-text-secondary)]">{message}</p>
        </Modal>
    );
}
