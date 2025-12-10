/**
 * Dashboard Client Component
 * Repo selection, hackathon context, settings, and evaluation trigger
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Button,
    Input,
    Select,
    Toggle,
    TerminalCard,
    StepProgress,
    LoadingBar,
} from '@/components/ui';

interface EvaluationStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
}

const INITIAL_STEPS: EvaluationStep[] = [
    { id: 'clone', name: 'Clone Repository', status: 'pending' },
    { id: 'metadata', name: 'Extract Metadata', status: 'pending' },
    { id: 'build', name: 'Building Project', status: 'pending' },
    { id: 'lighthouse', name: 'Running Lighthouse', status: 'pending' },
    { id: 'screenshots', name: 'Capturing Screenshots', status: 'pending' },
    { id: 'agents', name: 'Multi-Agent Analysis', status: 'pending' },
    { id: 'report', name: 'Generating Report', status: 'pending' },
];

const BRANCH_OPTIONS = [
    { value: 'main', label: 'main' },
    { value: 'master', label: 'master' },
    { value: 'develop', label: 'develop' },
];

const BUILD_TYPE_OPTIONS = [
    { value: 'full', label: 'Full (recommended)' },
    { value: 'quick', label: 'Quick (skip some checks)' },
];

const TIMEOUT_OPTIONS = [
    { value: '3', label: '3 minutes' },
    { value: '5', label: '5 minutes' },
    { value: '10', label: '10 minutes' },
];

export function DashboardClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Form state
    const [repoUrl, setRepoUrl] = useState(searchParams.get('repo') || '');
    const [hackathonUrl, setHackathonUrl] = useState('');
    const [branch, setBranch] = useState('main');
    const [buildType, setBuildType] = useState('full');
    const [timeout, setTimeout] = useState('5');
    const [skipLighthouse, setSkipLighthouse] = useState(false);
    const [skipScreenshots, setSkipScreenshots] = useState(false);

    // Evaluation state
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [steps, setSteps] = useState<EvaluationStep[]>(INITIAL_STEPS);
    const [currentStep, setCurrentStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [error, setError] = useState('');
    const [jobId, setJobId] = useState<string | null>(null);

    // Timer for elapsed time
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isEvaluating) {
            interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isEvaluating]);

    // Simulate evaluation progress (replace with real SSE/WebSocket for Kestra progress)
    useEffect(() => {
        if (!isEvaluating || !jobId) return;

        const simulateProgress = async () => {
            for (let i = 0; i < INITIAL_STEPS.length; i++) {
                // Mark current step as running
                setSteps((prev) =>
                    prev.map((step, idx) =>
                        idx === i ? { ...step, status: 'running' } : step
                    )
                );
                setCurrentStep(i);
                setLogs((prev) => [...prev, `> Starting: ${INITIAL_STEPS[i].name}...`]);

                // Simulate step duration (TODO: replace with real SSE from /api/evaluate/[jobId]/progress)
                await new Promise((resolve) =>
                    window.setTimeout(resolve, 1500 + Math.random() * 1000)
                );

                // Mark step as complete
                setSteps((prev) =>
                    prev.map((step, idx) =>
                        idx === i ? { ...step, status: 'complete' } : step
                    )
                );
                setLogs((prev) => [...prev, `✓ Completed: ${INITIAL_STEPS[i].name}`]);
            }

            // Navigate to report page with real job ID
            setLogs((prev) => [...prev, '> Evaluation complete! Redirecting...']);
            await new Promise((resolve) => window.setTimeout(resolve, 1000));
            router.push(`/report/${jobId}`);
        };

        simulateProgress();
    }, [isEvaluating, jobId, router]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    };

    const handleStartEvaluation = async () => {
        if (!repoUrl.trim()) {
            setError('Repository URL is required');
            return;
        }

        setError('');
        setIsEvaluating(true);
        setSteps(INITIAL_STEPS);
        setCurrentStep(0);
        setLogs(['> Initializing evaluation...']);
        setElapsedTime(0);

        try {
            // Call the real API
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoUrl: repoUrl.trim(),
                    branch,
                    hackathonUrl: hackathonUrl.trim() || undefined,
                    settings: {
                        buildType,
                        timeout: parseInt(timeout),
                        skipLighthouse,
                        skipScreenshots,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to start evaluation');
            }

            setJobId(data.data.jobId);
            setLogs((prev) => [
                ...prev,
                `> Job created: ${data.data.jobId}`,
                `> Mode: ${data.data.mode}`,
                data.data.executionId ? `> Kestra execution: ${data.data.executionId}` : '> Running in mock mode',
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start evaluation');
            setIsEvaluating(false);
        }
    };

    // Evaluation Progress View
    if (isEvaluating) {
        return (
            <main className="min-h-screen p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-2">
                        <span className="text-[var(--color-text-secondary)]">&gt;</span> Evaluation in Progress...
                    </h1>
                    <div className="text-[var(--color-border)] font-mono text-sm mb-8 overflow-hidden">
                        ════════════════════════════════════════════════════════
                    </div>

                    {/* Progress Steps */}
                    <TerminalCard className="mb-6">
                        <StepProgress steps={steps} currentStep={currentStep} />
                    </TerminalCard>

                    {/* Progress Metadata */}
                    <div className="flex flex-wrap gap-6 mb-6 text-sm">
                        <div>
                            <span className="text-[var(--color-text-dim)]">Current step:</span>{' '}
                            <span className="text-[var(--color-text-primary)]">
                                {INITIAL_STEPS[currentStep]?.name} ({currentStep + 1} of {INITIAL_STEPS.length})
                            </span>
                        </div>
                        <div>
                            <span className="text-[var(--color-text-dim)]">Elapsed:</span>{' '}
                            <span className="text-[var(--color-text-primary)]">{formatTime(elapsedTime)}</span>
                            <span className="text-[var(--color-text-dim)]"> | Estimated: 5m</span>
                        </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="mb-6">
                        <LoadingBar
                            progress={((currentStep + 1) / INITIAL_STEPS.length) * 100}
                        />
                    </div>

                    {/* Live Logs */}
                    <TerminalCard title="Live Logs">
                        <div className="h-48 overflow-y-auto font-mono text-sm">
                            {logs.map((log, index) => (
                                <div
                                    key={index}
                                    className={`py-0.5 ${log.startsWith('✓')
                                        ? 'text-[var(--color-accent-success)]'
                                        : log.startsWith('✗')
                                            ? 'text-[var(--color-accent-error)]'
                                            : 'text-[var(--color-text-secondary)]'
                                        }`}
                                >
                                    {log}
                                </div>
                            ))}
                            <div className="text-[var(--color-text-primary)] animate-pulse">
                                █
                            </div>
                        </div>
                    </TerminalCard>
                </div>
            </main>
        );
    }

    // Dashboard Form View
    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold">
                        <span className="text-[var(--color-text-secondary)]">&gt;</span> HackJudge Dashboard
                    </h1>
                    <Link
                        href="/"
                        className="text-[var(--color-text-dim)] text-sm hover:text-[var(--color-text-primary)]"
                    >
                        [Back to Home]
                    </Link>
                </div>
                <div className="text-[var(--color-border)] font-mono text-sm mb-8 overflow-hidden">
                    ════════════════════════════════════════════════════════
                </div>

                {/* Project Source */}
                <TerminalCard title="Project Source" className="mb-6">
                    <div className="space-y-4">
                        <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                            <span className="text-[var(--color-text-primary)]">&gt;</span> Select your repo (if authenticated) or paste GitHub URL:
                        </p>

                        <Input
                            label="GitHub Repository URL"
                            placeholder="https://github.com/owner/repo"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            error={error}
                            hint="Public repositories only. Private repos require GitHub authentication."
                        />
                    </div>
                </TerminalCard>

                {/* Hackathon Context */}
                <TerminalCard title="Hackathon Context (optional)" className="mb-6">
                    <Input
                        label="Hackathon page / rubric URL"
                        placeholder="https://devpost.com/hackathons/your-hackathon"
                        value={hackathonUrl}
                        onChange={(e) => setHackathonUrl(e.target.value)}
                        hint="Helps us extract judging criteria for more relevant feedback"
                    />
                </TerminalCard>

                {/* Settings */}
                <TerminalCard title="Settings (optional)" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Select
                            label="Branch"
                            options={BRANCH_OPTIONS}
                            value={branch}
                            onChange={setBranch}
                        />
                        <Select
                            label="Build Type"
                            options={BUILD_TYPE_OPTIONS}
                            value={buildType}
                            onChange={setBuildType}
                        />
                        <Select
                            label="Timeout"
                            options={TIMEOUT_OPTIONS}
                            value={timeout}
                            onChange={setTimeout}
                        />
                    </div>

                    <div className="flex flex-wrap gap-6 mt-6">
                        <Toggle
                            checked={skipLighthouse}
                            onChange={setSkipLighthouse}
                            label="Skip Lighthouse audit"
                        />
                        <Toggle
                            checked={skipScreenshots}
                            onChange={setSkipScreenshots}
                            label="Skip screenshots"
                        />
                    </div>
                </TerminalCard>

                {/* Start Button */}
                <div className="mt-8">
                    <Button
                        variant="success"
                        size="lg"
                        className="w-full md:w-auto"
                        onClick={handleStartEvaluation}
                    >
                        Start Evaluation
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-12 text-[var(--color-text-dim)] text-xs border-t border-[var(--color-border)] pt-6">
                    <p>
                        <span className="text-[var(--color-text-secondary)]">Note:</span> Evaluation typically takes 3-5 minutes depending on project size.
                    </p>
                    <p className="mt-1">
                        The AI will analyze code quality, UX, performance, and more.
                    </p>
                </div>
            </div>
        </main>
    );
}
