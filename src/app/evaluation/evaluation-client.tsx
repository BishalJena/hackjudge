'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface EvaluationStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
}

const INITIAL_STEPS: EvaluationStep[] = [
    { id: 'setup', name: 'Fetching Repository', status: 'pending' },
    { id: 'metadata', name: 'Extracting Metadata', status: 'pending' },
    { id: 'analyze', name: 'Running AI Analysis', status: 'pending' },
    { id: 'report', name: 'Generating Report', status: 'pending' },
];

export function EvaluationClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const logEndRef = useRef<HTMLDivElement>(null);
    const lastLogCountRef = useRef(0);
    const hasStartedRef = useRef(false);

    // Get params from URL
    const repoUrl = searchParams.get('repo') || '';
    const branch = searchParams.get('branch') || 'main';
    const hackathonUrl = searchParams.get('hackathon') || '';

    // Evaluation state
    const [steps, setSteps] = useState<EvaluationStep[]>(INITIAL_STEPS);
    const [currentStep, setCurrentStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [error, setError] = useState('');
    const [jobId, setJobId] = useState<string | null>(null);
    const [executionId, setExecutionId] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Timer
    useEffect(() => {
        if (!jobId || isComplete) return;
        const timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, [jobId, isComplete]);

    // Auto-start evaluation on mount
    useEffect(() => {
        if (hasStartedRef.current || !repoUrl) return;
        hasStartedRef.current = true;
        startEvaluation();
    }, [repoUrl]);

    // SSE connection for progress updates
    useEffect(() => {
        if (!jobId) return;

        const url = new URL(`/api/evaluate/${jobId}/stream`, window.location.origin);
        url.searchParams.set('repoUrl', repoUrl);
        url.searchParams.set('branch', branch);
        if (executionId) {
            url.searchParams.set('executionId', executionId);
        }

        const eventSource = new EventSource(url.toString());

        eventSource.addEventListener('connected', (event) => {
            const data = JSON.parse(event.data);
            setLogs((prev) => [...prev, `> CONNECTION_ESTABLISHED [MODE: ${data.mode || 'LLM'}]`]);
        });

        eventSource.addEventListener('progress', (event) => {
            const data = JSON.parse(event.data);
            if (data.steps) setSteps(data.steps);
            if (typeof data.currentStep === 'number') setCurrentStep(data.currentStep);
            // Fix: Only append NEW logs
            if (data.logs && Array.isArray(data.logs)) {
                const newLogs = data.logs.slice(lastLogCountRef.current);
                if (newLogs.length > 0) {
                    setLogs((prev) => [...prev, ...newLogs.map((l: string) => `> ${l}`)]);
                    lastLogCountRef.current = data.logs.length;
                }
            }
        });

        eventSource.addEventListener('complete', (event) => {
            const data = JSON.parse(event.data);
            setIsComplete(true);
            setLogs((prev) => [...prev, '✓ EVALUATION_COMPLETE', '> REDIRECTING_TO_ANALYSIS...']);
            window.setTimeout(() => {
                router.push(`/report/${data.projectId || jobId}`);
            }, 1500);
        });

        eventSource.addEventListener('error', (event: Event) => {
            if (event instanceof MessageEvent && event.data) {
                const data = JSON.parse(event.data);
                setError(data.message || 'EVALUATION_FAILED');
                setLogs((prev) => [...prev, `✗ ERROR: ${data.message || 'FATAL_ERROR'}`]);
            } else {
                setError('CONNECTION_LOST');
                setLogs((prev) => [...prev, '✗ CONNECTION_LOST']);
            }
        });

        return () => eventSource.close();
    }, [jobId, repoUrl, branch, executionId, router]);

    const startEvaluation = async () => {
        if (!repoUrl.trim()) {
            setError('REPO_URL_REQUIRED');
            return;
        }

        setLogs(['> INITIALIZING_SYSTEM...', '> ALLOCATING_RESOURCES...']);

        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoUrl: repoUrl.trim(),
                    branch,
                    hackathonUrl: hackathonUrl.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'INIT_FAILED');
            }

            setJobId(data.data.jobId);
            if (data.data.executionId) setExecutionId(data.data.executionId);

            setLogs((prev) => [
                ...prev,
                `> JOB_ID: ${data.data.jobId}`,
                `> EXEC_MODE: ${data.data.mode}`,
                data.data.executionId ? `> KESTRA_ID: ${data.data.executionId}` : '> LOCAL_LLM_FALLBACK',
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'INIT_FAILED');
            setLogs((prev) => [...prev, `✗ ${err instanceof Error ? err.message : 'INIT_FAILED'}`]);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRetry = () => {
        setError('');
        lastLogCountRef.current = 0;
        hasStartedRef.current = false;
        setLogs([]);
        setJobId(null);
        setExecutionId(null);
        setIsComplete(false);
        setSteps(INITIAL_STEPS);
        setCurrentStep(0);
        startEvaluation();
    };

    if (!repoUrl) {
        return (
            <main className="min-h-screen bg-terminal-black text-terminal-green font-mono p-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl mb-4">ERROR: NO_REPO_URL</p>
                    <p className="text-terminal-dim mb-6">Please select a repository from the home page.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="border border-terminal-green px-6 py-3 hover:bg-terminal-green/10"
                    >
                        [GO_HOME]
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-terminal-black text-terminal-green font-mono p-4 md:p-8 selection:bg-terminal-green selection:text-black flex flex-col">
            {/* Top Status Bar */}
            <div className="border-b border-terminal-green/30 pb-2 mb-6 flex justify-between items-end uppercase text-xs">
                <div className="flex gap-6">
                    <span>STATUS: {isComplete ? 'COMPLETE' : 'RUNNING'}</span>
                    <span>CPU: 45%</span>
                    <span>MEM: 4.2GB</span>
                </div>
                <div>TIME: {formatTime(elapsedTime)}</div>
            </div>

            {/* Split Pane */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left Pane: Progress Steps */}
                <div className="lg:col-span-4 border border-terminal-green/30 p-4 flex flex-col h-[600px]">
                    <div className="text-xs text-terminal-dim mb-4 border-b border-terminal-green/10 pb-2">
                        EVALUATION_PROGRESS
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {steps.map((step, index) => {
                            const isActive = index === currentStep && !isComplete;
                            const isStepComplete = step.status === 'complete' || index < currentStep;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-3 text-sm ${isActive ? 'text-white' : isStepComplete ? 'text-terminal-green' : 'text-terminal-dim'
                                        }`}
                                >
                                    <span className="font-bold w-6">
                                        {isActive ? '>' : isStepComplete ? '✓' : '○'}
                                    </span>
                                    <span className={isActive ? 'animate-pulse' : ''}>
                                        {step.name}
                                    </span>
                                    {isActive && <span className="ml-auto text-xs animate-spin">|</span>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="text-xs text-terminal-dim mb-1 flex justify-between">
                            <span>COMPLETION</span>
                            <span>{isComplete ? 100 : Math.round((currentStep / steps.length) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-terminal-dim/20 w-full">
                            <div
                                className="h-full bg-terminal-green transition-all duration-500 ease-out"
                                style={{ width: `${isComplete ? 100 : (currentStep / steps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Pane: Logs */}
                <div className="lg:col-span-8 border border-terminal-green/30 p-4 flex flex-col bg-black/50 h-[600px]">
                    <div className="text-xs text-terminal-dim mb-2 border-b border-terminal-green/10 pb-2 flex justify-between">
                        <span>SYSTEM_LOGS</span>
                        <span>/var/log/hackjudge.log</span>
                    </div>
                    <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1 scrollbar-hide">
                        {logs.map((log, i) => (
                            <div key={i} className="break-all opacity-90 hover:opacity-100">
                                {log}
                            </div>
                        ))}
                        <div ref={logEndRef} />
                        {!isComplete && !error && (
                            <div className="animate-pulse text-terminal-green">_</div>
                        )}
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mt-4 p-3 border border-red-500/50 bg-red-500/10 flex items-center justify-between">
                            <div className="text-red-400 text-sm font-mono">⚠ {error}</div>
                            <button
                                onClick={handleRetry}
                                className="text-red-400 border border-red-400 px-3 py-1 text-xs hover:bg-red-400/20 transition-colors font-mono"
                            >
                                RETRY
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Repository Info */}
            <div className="mt-6 text-xs text-terminal-dim border-t border-terminal-green/10 pt-4">
                <span>TARGET: {repoUrl}</span>
                <span className="mx-4">|</span>
                <span>BRANCH: {branch}</span>
                {hackathonUrl && <><span className="mx-4">|</span><span>HACKATHON: {hackathonUrl}</span></>}
            </div>

            {/* Scanline effect */}
            <div className="scanline" />
        </main>
    );
}
