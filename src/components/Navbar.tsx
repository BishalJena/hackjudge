'use client';

/**
 * Navbar Component
 * Shows logo, navigation links, and auth state
 */

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GitHubSignInButton, UserMenu } from '@/components/auth';

interface NavbarProps {
    className?: string;
    variant?: 'transparent' | 'solid';
}

export function Navbar({ className = '', variant = 'transparent' }: NavbarProps) {
    const { isAuthenticated, isLoading } = useAuth();

    const bgClass = variant === 'solid'
        ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800'
        : 'bg-transparent';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 ${bgClass} ${className}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-green-400 font-mono text-lg group-hover:text-green-300 transition-colors">
                            &gt;_
                        </span>
                        <span className="font-bold text-lg tracking-wide">
                            HackJudge
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Dashboard
                        </Link>
                        <a
                            href="https://github.com/BishalJena/HackJudge"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            GitHub
                            <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
                        ) : isAuthenticated ? (
                            <UserMenu />
                        ) : (
                            <GitHubSignInButton variant="outline" size="sm" />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function ExternalLinkIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );
}
