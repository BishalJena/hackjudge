/**
 * Landing Page Client Component
 * GitHub OAuth button + Manual repo URL input
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, TerminalCard } from '@/components/ui';

export function LandingPageClient() {
    const router = useRouter();
    const [repoUrl, setRepoUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateGitHubUrl = (url: string): boolean => {
        const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
        return githubRegex.test(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!repoUrl.trim()) {
            setError('Repository URL is required');
            return;
        }

        if (!validateGitHubUrl(repoUrl.trim())) {
            setError('Invalid GitHub repository URL');
            return;
        }

        setIsLoading(true);
        // Navigate to dashboard with repo URL as query param
        router.push(`/dashboard?repo=${encodeURIComponent(repoUrl.trim())}`);
    };

    const handleGitHubAuth = () => {
        // TODO: Implement GitHub OAuth
        router.push('/api/auth/github');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider">
                        HackJudge AI
                    </h1>
                    <div className="text-[var(--color-border)] font-mono text-sm mb-6 overflow-hidden">
                        ════════════════════════════════════════════════════════
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-lg">
                        Autonomous Hackathon Review Agent
                    </p>
                    <p className="text-[var(--color-text-dim)] text-sm mt-2">
                        Get instant, AI-powered feedback on code quality, UX, performance, and more.
                    </p>
                </div>

                {/* Main Card */}
                <TerminalCard className="mb-8">
                    {/* GitHub OAuth Option */}
                    <div className="mb-8">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={handleGitHubAuth}
                        >
                            Connect GitHub
                        </Button>
                        <p className="text-[var(--color-text-dim)] text-xs text-center mt-2">
                            Access your repositories directly
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 border-t border-[var(--color-border)]" />
                        <span className="text-[var(--color-text-secondary)] text-sm">or</span>
                        <div className="flex-1 border-t border-[var(--color-border)]" />
                    </div>

                    {/* Manual URL Input */}
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Paste repo URL below"
                            placeholder="https://github.com/owner/repo"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            error={error}
                            hint="Public repositories only"
                        />

                        <div className="mt-6">
                            <Button
                                type="submit"
                                variant="default"
                                size="lg"
                                className="w-full"
                                loading={isLoading}
                            >
                                Start Evaluation
                            </Button>
                        </div>
                    </form>
                </TerminalCard>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4">
                        <div className="text-[var(--color-accent-success)] text-2xl mb-2">✓</div>
                        <h3 className="text-sm font-bold mb-1">Code Quality</h3>
                        <p className="text-[var(--color-text-dim)] text-xs">Architecture & best practices</p>
                    </div>
                    <div className="p-4">
                        <div className="text-[var(--color-accent-success)] text-2xl mb-2">✓</div>
                        <h3 className="text-sm font-bold mb-1">Performance</h3>
                        <p className="text-[var(--color-text-dim)] text-xs">Lighthouse audits & metrics</p>
                    </div>
                    <div className="p-4">
                        <div className="text-[var(--color-accent-success)] text-2xl mb-2">✓</div>
                        <h3 className="text-sm font-bold mb-1">UX Analysis</h3>
                        <p className="text-[var(--color-text-dim)] text-xs">Design & accessibility review</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-[var(--color-text-dim)] text-xs">
                    <p>
                        Built for{' '}
                        <span className="text-[var(--color-text-secondary)]">AI Agents Assemble Hackathon</span>
                    </p>
                    <p className="mt-1">
                        Powered by Kestra + Together AI
                    </p>
                </div>
            </div>
        </main>
    );
}
