'use client';

import { useState, useEffect, useRef } from 'react';
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

        if (!hackathonUrl.trim()) {
            setHackathonInfo(null);
            return;
        }

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

    // Row component for consistent layout
    const Row = ({ label, children, minHeight }: { label: string; children: React.ReactNode; minHeight?: string }) => (
        <div className="flex" style={{ minHeight }}>
            <div className="hidden lg:block w-28 shrink-0 text-right pr-6 text-terminal-dim text-sm pt-1">
                {label}
            </div>
            <div className="flex-1">
                <div className="text-terminal-dim lg:hidden text-sm mb-2">{label}:</div>
                {children}
            </div>
        </div>
    );

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

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side: Main content (8 cols) */}
                <div className="lg:col-span-8 space-y-5">

                    {/* SYSTEM */}
                    <Row label="SYSTEM" minHeight="48px">
                        <h1 className="text-4xl font-bold tracking-tighter overflow-hidden">
                            <TypeShuffle text="HACKJUDGE_AI" delay={0} speed={40} />
                            <span className="animate-cursor-blink ml-1">_</span>
                        </h1>
                    </Row>

                    {/* MISSION */}
                    <Row label="MISSION" minHeight="60px">
                        <p className="text-sm leading-relaxed max-w-md overflow-hidden">
                            <TypeShuffle
                                text="Autonomous hackathon project evaluation system. Analyzes code quality, security, and innovation metrics."
                                delay={500}
                                speed={20}
                            />
                        </p>
                    </Row>

                    {/* TARGET */}
                    <Row label="TARGET">
                        {authLoading ? (
                            <div className="text-sm animate-pulse">Initializing auth module...</div>
                        ) : isAuthenticated && user ? (
                            <div className="space-y-3">
                                <div className="flex gap-4 text-xs">
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
                                    <div className="border border-terminal-green/30 p-2 max-h-48 overflow-y-auto scrollbar-hide">
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
                                            aria-label="GitHub repository URL"
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
                    </Row>

                    {/* CONFIG */}
                    <Row label="CONFIG">
                        <div className="space-y-1">
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
                        </div>
                    </Row>

                    {/* HACKATHON */}
                    <Row label="HACKATHON">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-terminal-green">&gt;</span>
                                <input
                                    type="text"
                                    aria-label="Hackathon page URL"
                                    value={hackathonUrl}
                                    onChange={(e) => setHackathonUrl(e.target.value)}
                                    className="bg-transparent border-b border-terminal-dim focus:border-terminal-green outline-none flex-1 max-w-md placeholder-terminal-dim/30"
                                    placeholder="https://hackathon.devpost.com"
                                />
                                {hackathonInfo?.loading && (
                                    <div className="flex items-center gap-2 text-terminal-green">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="text-xs">PARSING</span>
                                    </div>
                                )}
                            </div>
                            {hackathonInfo && !hackathonInfo.loading && hackathonInfo.criteria.length > 0 && (
                                <div className="mt-3 border border-terminal-green/30 p-3">
                                    <div className="text-xs text-terminal-dim mb-2 flex items-center gap-2">
                                        <span className="text-terminal-green">■</span>
                                        JUDGING_CRITERIA [{hackathonInfo.criteria.length}]
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {hackathonInfo.criteria.map((c, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="text-terminal-green font-bold w-10 text-right">
                                                    {c.weight ? `${c.weight}%` : '—'}
                                                </span>
                                                <span className="text-terminal-green/70">{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Row>

                    {/* Execute Button (no label) */}
                    <div className="flex">
                        <div className="hidden lg:block w-28 shrink-0" />
                        <div className="flex-1 pt-2">
                            {error && (
                                <div className="text-red-500 text-sm mb-3 animate-pulse">
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
                </div>

                {/* Right side: ASCII Art (4 cols) */}
                <div className="hidden lg:flex lg:col-span-4 flex-col justify-start items-center pt-8 opacity-50 hover:opacity-100 transition-opacity duration-500">
                    <div className="border border-terminal-green/20 p-4 relative">
                        <div className="absolute -top-3 left-4 bg-terminal-black px-2 text-xs text-terminal-dim">
                            VISUAL_FEED
                        </div>
                        <AsciiArt />
                        <div className="mt-4 text-center text-xs text-terminal-dim">
                            <TypeShuffle text="SYSTEM_ONLINE" delay={2000} speed={100} />
                        </div>
                    </div>

                    <div className="mt-8 w-full space-y-2 font-mono text-[10px] text-terminal-dim">
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
