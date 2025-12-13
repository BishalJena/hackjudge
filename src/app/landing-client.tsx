'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TypeShuffle, AsciiArt } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { GitHubSignInButton } from '@/components/auth';

interface Repo {
    id: number;
    name: string;
    fullName: string;
    isPrivate: boolean;
    url: string;
    defaultBranch: string;
    language: string | null;
}

export function LandingPageClient() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();

    // Repo selection state
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
    const [repoUrl, setRepoUrl] = useState('');
    const [inputMode, setInputMode] = useState<'list' | 'url'>('list');

    // Analysis options
    const [runSecurityScan, setRunSecurityScan] = useState(true);
    const [runCICDCheck, setRunCICDCheck] = useState(true);
    const [hackathonUrl, setHackathonUrl] = useState('');
    const [hackathonInfo, setHackathonInfo] = useState<{
        name: string;
        criteria: { name: string; weight?: number }[];
        loading: boolean;
    } | null>(null);

    // Form state
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Prevent infinite fetch loop
    const hasFetchedRepos = useRef(false);
    const hackathonFetchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch hackathon info when URL changes (debounced)
    useEffect(() => {
        if (hackathonFetchTimeout.current) {
            clearTimeout(hackathonFetchTimeout.current);
        }

        // Check if it's a valid URL (any hackathon site supported)
        if (!hackathonUrl.trim()) {
            setHackathonInfo(null);
            return;
        }

        // Validate URL format
        try {
            new URL(hackathonUrl.trim());
        } catch {
            setHackathonInfo(null);
            return;
        }

        hackathonFetchTimeout.current = setTimeout(async () => {
            setHackathonInfo({ name: '', criteria: [], loading: true });
            try {
                const response = await fetch('/api/hackathon/scrape', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: hackathonUrl.trim() }),
                });
                const data = await response.json();
                if (data.success && data.data) {
                    setHackathonInfo({
                        name: data.data.name,
                        criteria: data.data.criteria,
                        loading: false,
                    });
                } else {
                    setHackathonInfo(null);
                }
            } catch {
                setHackathonInfo(null);
            }
        }, 800);

        return () => {
            if (hackathonFetchTimeout.current) {
                clearTimeout(hackathonFetchTimeout.current);
            }
        };
    }, [hackathonUrl]);

    // Fetch user repos after authentication (only once)
    useEffect(() => {
        if (isAuthenticated && !hasFetchedRepos.current && !loadingRepos) {
            hasFetchedRepos.current = true;
            fetchRepos();
        }
    }, [isAuthenticated, loadingRepos]);

    const fetchRepos = async () => {
        setLoadingRepos(true);
        try {
            const response = await fetch('/api/github/repos?sort=updated&per_page=10');
            const data = await response.json();
            if (data.success && data.repos) {
                setRepos(data.repos);
            }
            // Don't retry on failure - hasFetchedRepos prevents re-fetch
        } catch (err) {
            console.error('Failed to fetch repos:', err);
        } finally {
            setLoadingRepos(false);
        }
    };

    const handleRepoSelect = (repo: Repo) => {
        if (selectedRepo?.id === repo.id) {
            setSelectedRepo(null);
            setRepoUrl('');
        } else {
            setSelectedRepo(repo);
            setRepoUrl(repo.url);
        }
    };

    const handleSubmit = async () => {
        setError('');
        const urlToUse = selectedRepo?.url || repoUrl.trim();

        if (!urlToUse) {
            setError('NO_TARGET_SELECTED');
            return;
        }

        setIsLoading(true);

        // Build query params for evaluation
        const params = new URLSearchParams({
            repo: urlToUse,
            branch: selectedRepo?.defaultBranch || 'main',
            securityScan: runSecurityScan.toString(),
            cicdCheck: runCICDCheck.toString(),
        });

        if (hackathonUrl.trim()) {
            params.set('hackathon', hackathonUrl.trim());
        }

        router.push(`/evaluation?${params.toString()}`);
    };

    return (
        <main className="min-h-screen bg-terminal-black text-terminal-green font-mono p-4 md:p-8 selection:bg-terminal-green selection:text-black">
            {/* Top Nav Bar */}
            <div className="border-b border-terminal-green/30 pb-2 mb-8 flex justify-between items-end">
                <div className="text-xs text-terminal-dim">
                    /home/{user?.login || 'guest'}/hackjudge
                </div>
                <div className="text-xs">
                    v2.0.0 [STABLE]
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                {/* Column 1: Labels (2 cols) */}
                <div className="hidden lg:block lg:col-span-2 text-right space-y-8 text-terminal-dim text-sm">
                    <div className="h-12 pt-2">SYSTEM</div>
                    <div className="h-auto pt-2">MISSION</div>
                    <div className="h-auto pt-2">TARGET</div>
                    <div className="h-auto pt-2">CONFIG</div>
                    <div className="h-auto pt-2">ACTION</div>
                </div>

                {/* Column 2: Content (6 cols) */}
                <div className="lg:col-span-6 space-y-8">
                    {/* SYSTEM */}
                    <div className="h-12">
                        <h1 className="text-4xl font-bold tracking-tighter">
                            <TypeShuffle text="HACKJUDGE_AI" delay={0} speed={40} />
                            <span className="animate-cursor-blink ml-1">_</span>
                        </h1>
                    </div>

                    {/* MISSION */}
                    <div className="text-sm leading-relaxed max-w-md">
                        <p className="mb-2">
                            <span className="text-terminal-dim lg:hidden mr-2">MISSION:</span>
                            <TypeShuffle
                                text="Autonomous hackathon project evaluation system. Analyzes code quality, security, and innovation metrics."
                                delay={500}
                                speed={20}
                            />
                        </p>
                    </div>

                    {/* TARGET */}
                    <div className="space-y-4">
                        <div className="text-terminal-dim lg:hidden text-sm mb-2">TARGET:</div>

                        {authLoading ? (
                            <div className="text-sm animate-pulse">Initializing auth module...</div>
                        ) : isAuthenticated && user ? (
                            <div className="space-y-4">
                                <div className="flex gap-4 text-xs mb-2">
                                    <button
                                        onClick={() => setInputMode('list')}
                                        className={`hover:text-white ${inputMode === 'list' ? 'text-terminal-green underline decoration-2 underline-offset-4' : 'text-terminal-dim'}`}
                                    >
                                        [1] LIST_REPOS
                                    </button>
                                    <button
                                        onClick={() => setInputMode('url')}
                                        className={`hover:text-white ${inputMode === 'url' ? 'text-terminal-green underline decoration-2 underline-offset-4' : 'text-terminal-dim'}`}
                                    >
                                        [2] MANUAL_URL
                                    </button>
                                </div>

                                {inputMode === 'list' ? (
                                    <div className="border border-terminal-green/30 p-2 max-h-60 overflow-y-auto scrollbar-hide">
                                        {loadingRepos ? (
                                            <div className="text-sm text-terminal-dim">Fetching repositories...</div>
                                        ) : (
                                            <ul className="space-y-1">
                                                {repos.map(repo => (
                                                    <li key={repo.id}>
                                                        <button
                                                            onClick={() => handleRepoSelect(repo)}
                                                            className={`w-full text-left text-sm px-2 py-1 hover:bg-terminal-green/10 flex items-center gap-3 group transition-colors ${selectedRepo?.id === repo.id ? 'bg-terminal-green/20 text-white' : 'text-terminal-green/80'}`}
                                                        >
                                                            <span className="text-terminal-dim group-hover:text-terminal-green">
                                                                {selectedRepo?.id === repo.id ? '[x]' : '[ ]'}
                                                            </span>
                                                            <span>{repo.name}</span>
                                                            {repo.isPrivate && <span className="text-xs text-terminal-dim ml-auto">PRIVATE</span>}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 border-b border-terminal-green/50 py-1">
                                        <span className="text-terminal-green">&gt;</span>
                                        <input
                                            type="text"
                                            className="bg-transparent border-none outline-none w-full text-sm font-mono placeholder-terminal-dim/50"
                                            placeholder="https://github.com/user/repo"
                                            value={repoUrl}
                                            onChange={(e) => {
                                                setRepoUrl(e.target.value);
                                                setSelectedRepo(null);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border border-terminal-green/30 p-4 text-center">
                                <p className="text-sm mb-4 text-terminal-dim">ACCESS_DENIED. AUTHENTICATION_REQUIRED.</p>
                                <GitHubSignInButton variant="terminal" className="text-sm font-bold" />
                            </div>
                        )}
                    </div>

                    {/* CONFIG */}
                    <div className="space-y-2">
                        <div className="text-terminal-dim lg:hidden text-sm mb-2">CONFIG:</div>
                        <button
                            onClick={() => setRunSecurityScan(!runSecurityScan)}
                            className="flex items-center gap-3 text-sm hover:text-white group"
                        >
                            <span className={runSecurityScan ? 'text-terminal-green' : 'text-terminal-dim'}>
                                {runSecurityScan ? '[x]' : '[ ]'}
                            </span>
                            <span className="group-hover:underline decoration-terminal-green/30 underline-offset-4">
                                ENABLE_SECURITY_AUDIT
                            </span>
                        </button>
                        <button
                            onClick={() => setRunCICDCheck(!runCICDCheck)}
                            className="flex items-center gap-3 text-sm hover:text-white group"
                        >
                            <span className={runCICDCheck ? 'text-terminal-green' : 'text-terminal-dim'}>
                                {runCICDCheck ? '[x]' : '[ ]'}
                            </span>
                            <span className="group-hover:underline decoration-terminal-green/30 underline-offset-4">
                                ENABLE_CICD_VERIFICATION
                            </span>
                        </button>

                        <div className="flex items-center gap-2 mt-4 text-sm">
                            <span className="text-terminal-dim">HACKATHON_URL:</span>
                            <input
                                type="text"
                                value={hackathonUrl}
                                onChange={(e) => setHackathonUrl(e.target.value)}
                                className="bg-transparent border-b border-terminal-dim focus:border-terminal-green outline-none w-full max-w-xs placeholder-terminal-dim/30"
                                placeholder="https://hackathon.devpost.com"
                            />
                            {hackathonInfo?.loading && (
                                <span className="text-terminal-dim animate-pulse">...</span>
                            )}
                        </div>

                        {/* Hackathon Info Display */}
                        {hackathonInfo && !hackathonInfo.loading && hackathonInfo.criteria.length > 0 && (
                            <div className="mt-3 p-3 border border-terminal-green/30 text-xs">
                                <div className="text-terminal-dim mb-2">JUDGING_CRITERIA:</div>
                                <div className="space-y-1">
                                    {hackathonInfo.criteria.slice(0, 5).map((c, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-terminal-green">{c.weight ? `${c.weight}%` : '•'}</span>
                                            <span>{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ACTION */}
                    <div className="pt-4">
                        <div className="text-terminal-dim lg:hidden text-sm mb-2">ACTION:</div>
                        {error && (
                            <div className="text-red-500 text-sm mb-4 animate-pulse">
                                ERROR: {error}
                            </div>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || (!selectedRepo && !repoUrl)}
                            className={`
                                group relative px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all
                                border font-mono
                                ${isLoading || (!selectedRepo && !repoUrl)
                                    ? 'border-terminal-green/50 text-terminal-dim cursor-not-allowed'
                                    : 'border-terminal-green text-terminal-green hover:bg-terminal-green/15 hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:text-white active:bg-terminal-green active:text-black'
                                }
                            `}
                        >
                            {isLoading ? (
                                <span className="animate-pulse">INITIALIZING...</span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span>&gt; EXECUTE_EVALUATION</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">_</span>
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Column 3: ASCII Art (4 cols) */}
                <div className="hidden lg:flex lg:col-span-4 flex-col justify-start items-center pt-12 opacity-50 hover:opacity-100 transition-opacity duration-500">
                    <div className="border border-terminal-green/20 p-4 relative">
                        <div className="absolute -top-3 left-4 bg-terminal-black px-2 text-xs text-terminal-dim">
                            VISUAL_FEED
                        </div>
                        <AsciiArt />
                        <div className="mt-4 text-center text-xs text-terminal-dim">
                            <TypeShuffle text="SYSTEM_ONLINE" delay={2000} speed={100} />
                        </div>
                    </div>

                    {/* Stats / Fixed Data (was random, caused hydration mismatch) */}
                    <div className="mt-12 w-full space-y-2 font-mono text-[10px] text-terminal-dim">
                        <div className="flex justify-between">
                            <span>CPU_LOAD</span>
                            <span>28%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>MEM_USAGE</span>
                            <span>42%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>NET_LATENCY</span>
                            <span>24ms</span>
                        </div>
                        <div className="h-px bg-terminal-dim/30 my-2" />
                        <div>
                            <span className="text-terminal-green">&gt;</span> LISTENING_ON_PORT_3000
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanline Overlay */}
            <div className="scanline" />
        </main>
    );
}
