'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { EvaluationResult } from '@/types';

interface ReportClientProps {
    result: EvaluationResult;
    projectId: string;
}

interface ChatMessage {
    role: 'assistant' | 'user';
    content: string;
}

export function ReportClient({ result, projectId }: ReportClientProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [creatingIssue, setCreatingIssue] = useState<string | null>(null);
    const [createdIssues, setCreatedIssues] = useState<Record<string, string>>({});
    const [creatingAllIssues, setCreatingAllIssues] = useState(false);
    const [allIssuesCreated, setAllIssuesCreated] = useState(0);
    const [pushingWorkflow, setPushingWorkflow] = useState(false);
    const [workflowPushed, setWorkflowPushed] = useState(false);
    const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Parse repo owner/name from URL
    const parseRepoUrl = (url?: string) => {
        if (!url) return { owner: '', repo: '' };
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        return match ? { owner: match[1], repo: match[2].replace('.git', '') } : { owner: '', repo: '' };
    };

    const { owner, repo } = parseRepoUrl(result.repoUrl);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Generate initial analysis messages
    useEffect(() => {
        const statusEmoji = {
            'STRONG': '🟢',
            'GOOD': '🟡',
            'NEEDS_WORK': '🟠',
            'WEAK': '🔴'
        }[result.status] || '⚪';

        // Extract vision from summary (first sentence usually describes the project)
        const visionMatch = result.summary?.match(/^[^.!?]+[.!?]/);
        const inferredVision = visionMatch ? visionMatch[0] : result.summary?.slice(0, 100);

        const initialMessages: ChatMessage[] = [
            {
                role: 'assistant',
                content: `## Analysis Complete ${statusEmoji}\n\nScore: **${result.readinessScore}/100** (${result.status})\n\n${result.summary}`
            },
            {
                role: 'assistant',
                content: `### 🎯 Project Vision\n\nI understand your project as: *"${inferredVision}"*\n\n**Is this correct?** If not, tell me the actual vision and I'll re-evaluate alignment.`
            },
            {
                role: 'assistant',
                content: `### 💪 Strengths\n${result.strengths.map(s => `✓ ${s}`).join('\n')}`
            },
            {
                role: 'assistant',
                content: `### ⚠️ Improvements\n${result.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}`
            }
        ];

        // Add security info if available
        if (result.security) {
            const secColor = result.security.score >= 80 ? '🟢' : result.security.score >= 60 ? '🟡' : '🔴';
            initialMessages.push({
                role: 'assistant',
                content: `### 🔒 Security ${secColor}\n\nScore: ${result.security.score}/100\n\nVulnerabilities: ${result.security.vulnerabilities.critical} critical, ${result.security.vulnerabilities.high} high, ${result.security.vulnerabilities.moderate} moderate\n\n${result.security.summary}`
            });
        }

        setMessages(initialMessages);
    }, [result, projectId]);

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    messages: [...messages, { role: 'user', content: userMessage }],
                    codeContext: { files: [], totalSnippets: 0 }
                }),
            });

            if (!response.ok) throw new Error('Chat failed');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                assistantMessage += data.content;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1] = {
                                        role: 'assistant',
                                        content: assistantMessage
                                    };
                                    return newMessages;
                                });
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Create GitHub issue
    const handleCreateIssue = async (improvement: string, index: number) => {
        const issueKey = `improvement-${index}`;
        if (createdIssues[issueKey] || creatingIssue === issueKey) return;

        setCreatingIssue(issueKey);

        try {
            const response = await fetch('/api/github/create-issue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner,
                    repo,
                    title: `[HackJudge] ${improvement.slice(0, 60)}...`,
                    body: `## Improvement\n\n${improvement}\n\n---\n_Created via HackJudge AI | Score: ${result.readinessScore}/100_`,
                    labels: ['hackjudge', 'improvement']
                }),
            });

            const data = await response.json();
            if (data.success) {
                setCreatedIssues(prev => ({ ...prev, [issueKey]: data.issue.url }));
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✅ Issue created: [View on GitHub](${data.issue.url})`
                }]);
            }
        } catch (error) {
            console.error('Failed to create issue:', error);
        } finally {
            setCreatingIssue(null);
        }
    };

    // Push CI/CD workflow to repo
    const handlePushWorkflow = async () => {
        if (!owner || !repo || pushingWorkflow || workflowPushed) return;

        setPushingWorkflow(true);
        try {
            const response = await fetch('/api/github/push-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ owner, repo }),
            });

            const data = await response.json();
            if (data.success) {
                setWorkflowPushed(true);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✅ CI/CD workflow created! [View on GitHub](${data.file?.url || data.commit?.url})`
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `❌ Failed to create workflow: ${data.error}`
                }]);
            }
        } catch (error) {
            console.error('Failed to push workflow:', error);
        } finally {
            setPushingWorkflow(false);
        }
    };

    // Create selected issues only
    const handleCreateSelectedIssues = async () => {
        if (!owner || !repo || creatingAllIssues || selectedIssues.size === 0) return;
        if (!result.improvements || result.improvements.length === 0) return;

        setCreatingAllIssues(true);
        try {
            const selectedImprovements = result.improvements.filter((_, idx) => selectedIssues.has(idx));

            const response = await fetch('/api/github/create-issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner,
                    repo,
                    improvements: selectedImprovements,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setAllIssuesCreated(data.created);
                setSelectedIssues(new Set()); // Clear selection
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✅ Created ${data.created} issues!\n\n${data.issues?.map((i: { title: string; url: string }) => `- [${i.title}](${i.url})`).join('\n')}`
                }]);
            }
        } catch (error) {
            console.error('Failed to create issues:', error);
        } finally {
            setCreatingAllIssues(false);
        }
    };

    // Toggle issue selection
    const toggleIssueSelection = (idx: number) => {
        setSelectedIssues(prev => {
            const newSet = new Set(prev);
            if (newSet.has(idx)) {
                newSet.delete(idx);
            } else {
                newSet.add(idx);
            }
            return newSet;
        });
    };

    // Select all issues
    const selectAllIssues = () => {
        if (!result.improvements) return;
        setSelectedIssues(new Set(result.improvements.map((_, idx) => idx)));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'STRONG': return 'text-green-400';
            case 'GOOD': return 'text-yellow-400';
            case 'NEEDS_WORK': return 'text-orange-400';
            case 'WEAK': return 'text-red-400';
            default: return 'text-terminal-green';
        }
    };

    return (
        <main className="min-h-screen bg-terminal-black text-terminal-green font-mono p-4 md:p-8 selection:bg-terminal-green selection:text-black flex flex-col">
            {/* Top Status Bar */}
            <div className="border-b border-terminal-green/30 pb-2 mb-6 flex justify-between items-end uppercase text-xs">
                <div className="flex gap-6">
                    <Link href="/" className="hover:text-white">[HOME]</Link>
                    <Link href="/" className="hover:text-white">[NEW_EVALUATION]</Link>
                </div>
                <div className="text-terminal-dim">
                    /var/reports/{projectId}.log
                </div>
            </div>

            {/* Split Pane - Matching evaluation page layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left Pane: Score & Dimensions */}
                <div className="lg:col-span-4 border border-terminal-green/30 p-4 flex flex-col h-[600px]">
                    <div className="text-xs text-terminal-dim mb-4 border-b border-terminal-green/10 pb-2">
                        ANALYSIS_SUMMARY
                    </div>

                    {/* Score Display */}
                    <div className="text-center py-4 border-b border-terminal-green/10 mb-4">
                        <div className="text-6xl font-bold mb-1">{result.readinessScore}</div>
                        <div className="text-xs text-terminal-dim mb-2">READINESS_SCORE</div>
                        <div className={`text-sm font-bold ${getStatusColor(result.status)}`}>
                            {result.status}
                        </div>
                        <div className="mt-3 h-2 bg-terminal-dim/20 w-full">
                            <div
                                className="h-full bg-terminal-green transition-all duration-500"
                                style={{ width: `${result.readinessScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Dimensions - Scrollable */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                        <div className="text-xs text-terminal-dim mb-2">DIMENSIONS</div>
                        {Object.entries(result.dimensions).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span className="text-xs uppercase w-24 truncate" title={key}>
                                    {key}
                                </span>
                                <div className="flex-1 h-1.5 bg-terminal-dim/20">
                                    <div
                                        className="h-full bg-terminal-green"
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                                <span className="text-xs w-8 text-right">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t border-terminal-green/10 pt-4 space-y-2">
                        <div className="text-xs text-terminal-dim mb-2">QUICK_ACTIONS</div>
                        <button
                            onClick={() => {
                                setInput('Explain why this project scored ' + result.readinessScore + '/100');
                            }}
                            className="w-full text-left text-xs px-3 py-2 border border-terminal-green/30 hover:bg-terminal-green/10"
                        >
                            [EXPLAIN_SCORE]
                        </button>
                        <button
                            onClick={() => setInput('What should I fix first?')}
                            className="w-full text-left text-xs px-3 py-2 border border-terminal-green/30 hover:bg-terminal-green/10"
                        >
                            [PRIORITIZE_FIXES]
                        </button>

                        {/* CI/CD Push Button */}
                        {owner && repo && (
                            <button
                                onClick={handlePushWorkflow}
                                disabled={pushingWorkflow || workflowPushed}
                                className="w-full text-left text-xs px-3 py-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 disabled:opacity-50"
                            >
                                {workflowPushed ? '[CI/CD_CREATED ✓]' : pushingWorkflow ? '[PUSHING...]' : '[SETUP_CI/CD]'}
                            </button>
                        )}

                        {/* Selective Issue Creation */}
                        {owner && repo && result.improvements && result.improvements.length > 0 && (
                            <div className="border-t border-terminal-green/10 pt-2 mt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-terminal-dim">IMPROVEMENTS</span>
                                    <button
                                        type="button"
                                        onClick={selectAllIssues}
                                        className="text-xs text-terminal-green hover:underline"
                                    >
                                        Select All
                                    </button>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {result.improvements.slice(0, 5).map((improvement, idx) => (
                                        <label
                                            key={idx}
                                            className={`flex items-start gap-2 text-xs p-1.5 cursor-pointer hover:bg-terminal-green/5 ${selectedIssues.has(idx) ? 'bg-terminal-green/10 border-l-2 border-terminal-green' : ''
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIssues.has(idx)}
                                                onChange={() => toggleIssueSelection(idx)}
                                                className="mt-0.5 accent-terminal-green"
                                            />
                                            <span className="flex-1 truncate" title={improvement.title}>
                                                {improvement.title}
                                            </span>
                                            <span className="text-green-400 text-xs shrink-0">
                                                +{improvement.impact}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {selectedIssues.size > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleCreateSelectedIssues}
                                        disabled={creatingAllIssues || allIssuesCreated > 0}
                                        className="w-full text-xs px-3 py-2 mt-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50"
                                    >
                                        {allIssuesCreated > 0
                                            ? `[${allIssuesCreated}_ISSUES_CREATED ✓]`
                                            : creatingAllIssues
                                                ? '[CREATING...]'
                                                : `[CREATE_ISSUES (${selectedIssues.size})]`}
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                            className="w-full text-left text-xs px-3 py-2 border border-terminal-green/30 hover:bg-terminal-green/10"
                        >
                            [COPY_JSON]
                        </button>
                    </div>
                </div>

                {/* Right Pane: Chat Analysis */}
                <div className="lg:col-span-8 border border-terminal-green/30 flex flex-col bg-black/50 h-[600px]">
                    {/* Header */}
                    <div className="text-xs text-terminal-dim p-4 border-b border-terminal-green/10 flex justify-between">
                        <span>ANALYSIS_CHAT</span>
                        <span>HACKJUDGE_AI</span>
                    </div>

                    {/* Messages - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((message, i) => (
                            <div
                                key={i}
                                className={`${message.role === 'user' ? 'ml-8' : 'mr-8'}`}
                            >
                                <div
                                    className={`p-3 text-sm ${message.role === 'user'
                                        ? 'bg-terminal-green/10 border-l-2 border-terminal-green'
                                        : 'bg-black/30 border-l-2 border-terminal-dim'
                                        }`}
                                >
                                    <div className="text-xs text-terminal-dim mb-1 uppercase">
                                        {message.role === 'user' ? 'YOU' : 'HACKJUDGE_AI'}
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="mr-8">
                                <div className="p-3 text-sm bg-black/30 border-l-2 border-terminal-dim">
                                    <div className="text-xs text-terminal-dim mb-1">HACKJUDGE_AI</div>
                                    <div className="animate-pulse">Analyzing...</div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input - Fixed at bottom of panel */}
                    <div className="p-4 border-t border-terminal-green/10">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Ask about your analysis..."
                                className="flex-1 bg-black/30 border border-terminal-green/30 px-4 py-2 text-sm text-terminal-green placeholder:text-terminal-dim focus:outline-none focus:border-terminal-green"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim()}
                                className="px-4 py-2 bg-terminal-green text-black text-xs font-bold hover:bg-white transition-colors disabled:opacity-50"
                            >
                                SEND
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 text-xs text-terminal-dim border-t border-terminal-green/10 pt-4">
                <span>PROJECT: {projectId}</span>
                {result.repoUrl && (
                    <>
                        <span className="mx-4">|</span>
                        <a href={result.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-terminal-green">
                            {result.repoUrl}
                        </a>
                    </>
                )}
            </div>

            {/* Scanline effect */}
            <div className="scanline" />
        </main>
    );
}
