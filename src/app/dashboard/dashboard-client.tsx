'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TypeShuffle } from '@/components/ui';

interface EvaluationStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
}

const INITIAL_STEPS: EvaluationStep[] = [
    { id: 'setup', name: 'FETCHING_REPO', status: 'pending' },
    { id: 'metadata', name: 'EXTRACTING_METADATA', status: 'pending' },
    { id: 'analyze', name: 'RUNNING_AI_ANALYSIS', status: 'pending' },
    { id: 'report', name: 'GENERATING_REPORT', status: 'pending' },
];

export function DashboardClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const logEndRef = useRef<HTMLDivElement>(null);
    const lastLogCountRef = useRef(0); // Track how many logs we've received to avoid duplicates

    // Form state
    const [repoUrl, setRepoUrl] = useState(searchParams.get('repo') || '');
    const [hackathonUrl, setHackathonUrl] = useState(searchParams.get('hackathon') || '');
    const [branch, setBranch] = useState(searchParams.get('branch') || 'main');
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
    const [executionId, setExecutionId] = useState<string | null>(null);

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

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

    // Real SSE streaming for evaluation progress
    useEffect(() => {
        if (!isEvaluating || !jobId) return;

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
            // Fix: Only append NEW logs (logs after lastLogCount)
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
            setLogs((prev) => [...prev, '✓ SEQUENCE_COMPLETE', '> REDIRECTING_TO_REPORT...']);
            window.setTimeout(() => {
                router.push(`/report/${data.projectId || jobId}`);
            }, 1000);
        });

        eventSource.addEventListener('error', (event: Event) => {
            if (event instanceof MessageEvent && event.data) {
                const data = JSON.parse(event.data);
                setError(data.message || 'FATAL_ERROR');
                setLogs((prev) => [...prev, `✗ ERROR: ${data.message || 'FATAL_ERROR'}`]);
            } else {
                setError('CONNECTION_LOST');
                setLogs((prev) => [...prev, '✗ CONNECTION_LOST - Click retry to reconnect']);
            }
            // Don't set isEvaluating to false for CONNECTION_LOST - allow retry
        });

        return () => eventSource.close();
    }, [isEvaluating, jobId, repoUrl, branch, executionId, router]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartEvaluation = async () => {
        if (!repoUrl.trim()) {
            setError('REPO_URL_REQUIRED');
            return;
        }

        setError('');
        setIsEvaluating(true);
        setSteps(INITIAL_STEPS);
        setCurrentStep(0);
        setLogs(['> INITIALIZING_SYSTEM...', '> ALLOCATING_RESOURCES...']);
        setElapsedTime(0);

        try {
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
            setIsEvaluating(false);
        }
    };

    return (
        <main className="min-h-screen bg-terminal-black text-terminal-green font-mono p-4 md:p-8 selection:bg-terminal-green selection:text-black flex flex-col">
            {/* Top Status Bar */}
            <div className="border-b border-terminal-green/30 pb-2 mb-6 flex justify-between items-end uppercase text-xs">
                <div className="flex gap-6">
                    <span>STATUS: {isEvaluating ? 'RUNNING' : 'IDLE'}</span>
                    <span>CPU: {isEvaluating ? 45 : 5}%</span>
                    <span>MEM: {isEvaluating ? '4.2GB' : '1.1GB'}</span>
                </div>
                <div>
                    TIME: {formatTime(elapsedTime)}
                </div>
            </div>

            {isEvaluating ? (
                /* Evaluation View (Split Pane) */
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    {/* Left Pane: Progress Steps */}
                    <div className="lg:col-span-4 border border-terminal-green/30 p-4 flex flex-col h-[600px]">
                        <div className="text-xs text-terminal-dim mb-4 border-b border-terminal-green/10 pb-2">
                            SEQUENCE_PROGRESS
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {steps.map((step, index) => {
                                const isActive = index === currentStep;
                                const isComplete = index < currentStep;
                                const isPending = index > currentStep;

                                return (
                                    <div key={step.id} className={`flex items-center gap-3 text-sm ${isActive ? 'text-white' : isComplete ? 'text-terminal-green' : 'text-terminal-dim'}`}>
                                        <span className="font-bold w-6">
                                            {isActive ? '>' : isComplete ? '✓' : '[ ]'}
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
                                <span>{Math.round(((currentStep) / steps.length) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-terminal-dim/20 w-full">
                                <div
                                    className="h-full bg-terminal-green transition-all duration-500 ease-out"
                                    style={{ width: `${((currentStep) / steps.length) * 100}%` }}
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
                            {isEvaluating && !error && (
                                <div className="animate-pulse text-terminal-green">_</div>
                            )}
                        </div>
                        {/* Error Banner with Retry */}
                        {error && (
                            <div className="mt-4 p-3 border border-red-500/50 bg-red-500/10 flex items-center justify-between">
                                <div className="text-red-400 text-sm font-mono">
                                    ⚠ {error}
                                </div>
                                {error === 'CONNECTION_LOST' && (
                                    <button
                                        onClick={() => {
                                            setError('');
                                            setLogs((prev) => [...prev, '> RETRYING_CONNECTION...']);
                                            // Force re-trigger SSE by updating jobId timestamp
                                            setJobId((prev) => prev);
                                        }}
                                        className="text-red-400 border border-red-400 px-3 py-1 text-xs hover:bg-red-400/20 transition-colors font-mono"
                                    >
                                        RETRY
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Configuration View */
                <div className="max-w-3xl mx-auto w-full pt-12">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">
                            <TypeShuffle text="INITIATE_EVALUATION_SEQUENCE" delay={0} />
                        </h1>
                        <div className="h-px bg-terminal-green/30 w-full" />
                    </div>

                    <div className="space-y-6">
                        {/* Target */}
                        <div className="group">
                            <label className="block text-xs text-terminal-dim mb-1 group-hover:text-terminal-green transition-colors">TARGET_REPOSITORY</label>
                            <input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                className="w-full bg-transparent border-b border-terminal-dim focus:border-terminal-green outline-none py-2 font-mono text-sm transition-colors"
                                placeholder="https://github.com/..."
                            />
                        </div>

                        {/* Params Grid */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="group">
                                <label className="block text-xs text-terminal-dim mb-1 group-hover:text-terminal-green transition-colors">TARGET_BRANCH</label>
                                <input
                                    type="text"
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    className="w-full bg-transparent border-b border-terminal-dim focus:border-terminal-green outline-none py-2 font-mono text-sm transition-colors"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs text-terminal-dim mb-1 group-hover:text-terminal-green transition-colors">TIMEOUT_MINS</label>
                                <select
                                    value={timeout}
                                    onChange={(e) => setTimeout(e.target.value)}
                                    className="w-full bg-transparent border-b border-terminal-dim focus:border-terminal-green outline-none py-2 font-mono text-sm transition-colors appearance-none rounded-none"
                                >
                                    <option value="3" className="bg-black">3</option>
                                    <option value="5" className="bg-black">5</option>
                                    <option value="10" className="bg-black">10</option>
                                </select>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-8 pt-4">
                            <button
                                onClick={() => setSkipLighthouse(!skipLighthouse)}
                                className="flex items-center gap-2 text-sm group"
                            >
                                <span className={skipLighthouse ? 'text-terminal-dim' : 'text-terminal-green'}>
                                    {!skipLighthouse ? '[x]' : '[ ]'}
                                </span>
                                <span className="text-terminal-dim group-hover:text-white transition-colors">ENABLE_LIGHTHOUSE</span>
                            </button>
                            <button
                                onClick={() => setSkipScreenshots(!skipScreenshots)}
                                className="flex items-center gap-2 text-sm group"
                            >
                                <span className={skipScreenshots ? 'text-terminal-dim' : 'text-terminal-green'}>
                                    {!skipScreenshots ? '[x]' : '[ ]'}
                                </span>
                                <span className="text-terminal-dim group-hover:text-white transition-colors">ENABLE_SCREENSHOTS</span>
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="text-red-500 text-sm py-4 animate-pulse">
                                ERROR: {error}
                            </div>
                        )}

                        {/* Action */}
                        <div className="pt-8">
                            <button
                                onClick={handleStartEvaluation}
                                className="border border-terminal-green text-terminal-green px-8 py-3 font-bold text-sm uppercase hover:bg-terminal-green/15 hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:text-white active:bg-terminal-green active:text-black transition-all w-full md:w-auto font-mono"
                            >
                                &gt; CONFIRM_AND_EXECUTE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanline */}
            <div className="scanline" />
        </main>
    );
}
