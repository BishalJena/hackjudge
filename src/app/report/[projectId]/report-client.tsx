/**
 * Report Client Component
 * Full evaluation report with all sections
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    TerminalCard,
    ProgressBar,
    Button,
    ExpansionCard,
    SectionHeader,
    BulletList,
    Modal,
    CodeBlock,
} from '@/components/ui';
import type { EvaluationResult } from '@/types';

interface ReportClientProps {
    result: EvaluationResult;
    projectId: string;
}

export function ReportClient({ result, projectId }: ReportClientProps) {
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showPitchModal, setShowPitchModal] = useState(false);

    const getStatusColor = (status: EvaluationResult['status']) => {
        switch (status) {
            case 'STRONG': return 'text-[var(--color-accent-success)]';
            case 'GOOD': return 'text-[var(--color-text-primary)]';
            case 'NEEDS_WORK': return 'text-[var(--color-accent-warning)]';
            case 'WEAK': return 'text-[var(--color-accent-error)]';
        }
    };

    const getDimensionVariant = (score: number): 'success' | 'warning' | 'error' | 'default' => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'default';
        if (score >= 40) return 'warning';
        return 'error';
    };

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold">
                        <span className="text-[var(--color-text-secondary)]">&gt;</span> Project Readiness Report
                    </h1>
                    <Link
                        href="/dashboard"
                        className="text-[var(--color-text-dim)] text-sm hover:text-[var(--color-text-primary)]"
                    >
                        [New Evaluation]
                    </Link>
                </div>
                <div className="text-[var(--color-border)] font-mono text-sm mb-6 overflow-hidden">
                    ════════════════════════════════════════════════════════
                </div>

                {/* Project Info */}
                <div className="mb-6 text-sm">
                    <p>
                        <span className="text-[var(--color-text-dim)]">Project:</span>{' '}
                        <span className="text-[var(--color-text-primary)]">{projectId}</span>
                    </p>
                    <p>
                        <span className="text-[var(--color-text-dim)]">Status:</span>{' '}
                        <span className={getStatusColor(result.status)}>{result.status}</span>
                    </p>
                </div>

                {/* Readiness Score */}
                <TerminalCard className="mb-8" variant="highlight">
                    <div className="text-center py-4">
                        <div className="text-6xl font-bold text-[var(--color-text-primary)] mb-2">
                            {result.readinessScore}
                            <span className="text-2xl text-[var(--color-text-dim)]"> / 100</span>
                        </div>
                        <div className="text-[var(--color-border)] font-mono text-sm mb-4 overflow-hidden">
                            ════════════════════════════════════════
                        </div>
                        <div className={`text-xl font-bold ${getStatusColor(result.status)}`}>
                            Status: ✓ {result.status}
                        </div>
                    </div>
                </TerminalCard>

                {/* Summary */}
                <SectionHeader title="Summary" />
                <TerminalCard className="mb-8">
                    <p className="text-[var(--color-text-secondary)]">{result.summary}</p>
                </TerminalCard>

                {/* Dimensions */}
                <SectionHeader title="Dimensions" />
                <TerminalCard className="mb-8">
                    <div className="space-y-4">
                        <ProgressBar
                            label="Innovation"
                            value={result.dimensions.innovation}
                            variant={getDimensionVariant(result.dimensions.innovation)}
                        />
                        <ProgressBar
                            label="Technical"
                            value={result.dimensions.technical}
                            variant={getDimensionVariant(result.dimensions.technical)}
                        />
                        <ProgressBar
                            label="UX & Design"
                            value={result.dimensions.ux}
                            variant={getDimensionVariant(result.dimensions.ux)}
                        />
                        <ProgressBar
                            label="Performance"
                            value={result.dimensions.performance}
                            variant={getDimensionVariant(result.dimensions.performance)}
                        />
                        <ProgressBar
                            label="Code Quality"
                            value={result.dimensions.codeQuality}
                            variant={getDimensionVariant(result.dimensions.codeQuality)}
                        />
                        <ProgressBar
                            label="Presentation"
                            value={result.dimensions.presentation}
                            variant={getDimensionVariant(result.dimensions.presentation)}
                        />
                    </div>
                </TerminalCard>

                {/* Key Strengths */}
                <SectionHeader title="Key Strengths" />
                <TerminalCard className="mb-8">
                    <BulletList items={result.strengths} variant="success" />
                </TerminalCard>

                {/* Improvements Needed */}
                <SectionHeader title="Improvements Needed" />
                <TerminalCard className="mb-8">
                    <BulletList items={result.weaknesses} variant="warning" />
                </TerminalCard>

                {/* Award Eligibility */}
                <SectionHeader title="Award Eligibility" />
                <TerminalCard className="mb-8">
                    <div className="space-y-2">
                        {result.awardEligibility.map((award, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className={
                                    award.eligible
                                        ? 'text-[var(--color-accent-success)]'
                                        : award.confidence > 50
                                            ? 'text-[var(--color-accent-warning)]'
                                            : 'text-[var(--color-accent-error)]'
                                }>
                                    {award.eligible ? '✓' : award.confidence > 50 ? '⋯' : '✗'}
                                </span>
                                <span className="text-[var(--color-text-secondary)]">{award.name}</span>
                                {award.reason && (
                                    <span className="text-[var(--color-text-dim)] text-sm">({award.reason})</span>
                                )}
                            </div>
                        ))}
                    </div>
                </TerminalCard>

                {/* Agent Feedback (Expandable) */}
                <SectionHeader title="Agent Feedback" />
                <div className="space-y-4 mb-8">
                    {result.agentFeedback.map((agent, index) => (
                        <ExpansionCard
                            key={index}
                            title={agent.agentName}
                            badge={`${agent.score}/100`}
                            variant={agent.score >= 80 ? 'success' : agent.score >= 60 ? 'default' : 'warning'}
                        >
                            <div className="space-y-4">
                                <div className="flex gap-4 text-sm">
                                    <span className="text-[var(--color-text-dim)]">
                                        Score: {agent.score}/100 | Confidence: {agent.confidence}%
                                    </span>
                                </div>

                                <blockquote className="border-l-2 border-[var(--color-border)] pl-4 italic text-[var(--color-text-secondary)]">
                                    &ldquo;{agent.judgeComment}&rdquo;
                                    <footer className="text-[var(--color-text-dim)] text-sm mt-1">— Judge Agent</footer>
                                </blockquote>

                                {agent.strengths.length > 0 && (
                                    <div>
                                        <h5 className="text-sm font-bold text-[var(--color-accent-success)] mb-2">Strengths:</h5>
                                        <BulletList items={agent.strengths} variant="success" />
                                    </div>
                                )}

                                {agent.weaknesses.length > 0 && (
                                    <div>
                                        <h5 className="text-sm font-bold text-[var(--color-accent-warning)] mb-2">Areas for Improvement:</h5>
                                        <BulletList items={agent.weaknesses} variant="warning" />
                                    </div>
                                )}
                            </div>
                        </ExpansionCard>
                    ))}
                </div>

                {/* Improvement Roadmap (Expandable) */}
                <SectionHeader title="Top Improvements" />
                <div className="space-y-4 mb-8">
                    {result.improvements.map((improvement, index) => (
                        <ExpansionCard
                            key={index}
                            title={`${improvement.rank}. [${improvement.category.toUpperCase()}] ${improvement.title}`}
                            badge={`+${improvement.impact} pts`}
                            variant={improvement.category === 'quick-win' ? 'success' : 'default'}
                        >
                            <div className="space-y-3 text-sm">
                                <p>
                                    <span className="text-[var(--color-text-dim)]">Issue:</span>{' '}
                                    <span className="text-[var(--color-text-secondary)]">{improvement.issue}</span>
                                </p>
                                <p>
                                    <span className="text-[var(--color-text-dim)]">Impact:</span>{' '}
                                    <span className="text-[var(--color-accent-success)]">+{improvement.impact} pts</span>
                                    <span className="text-[var(--color-text-dim)]"> | Effort:</span>{' '}
                                    <span className="text-[var(--color-text-secondary)]">{improvement.effort}h</span>
                                </p>
                                {improvement.actionItems.length > 0 && (
                                    <div>
                                        <h5 className="text-[var(--color-text-dim)] mb-1">Action Items:</h5>
                                        <BulletList items={improvement.actionItems} />
                                    </div>
                                )}
                            </div>
                        </ExpansionCard>
                    ))}
                </div>

                {/* Actions */}
                <SectionHeader title="Actions" />
                <TerminalCard className="mb-8">
                    <div className="flex flex-wrap gap-4">
                        <Button onClick={() => setShowSubmissionModal(true)}>
                            Generate Submission Draft
                        </Button>
                        <Button onClick={() => setShowPitchModal(true)}>
                            Generate Pitch Script
                        </Button>
                        <Button variant="ghost" onClick={() => window.print()}>
                            Export Report
                        </Button>
                    </div>
                </TerminalCard>

                {/* Submission Draft Modal */}
                <Modal
                    isOpen={showSubmissionModal}
                    onClose={() => setShowSubmissionModal(false)}
                    title="DevPost Submission Draft"
                    size="lg"
                    footer={
                        <div className="flex gap-3">
                            <Button onClick={() => navigator.clipboard.writeText(result.generatedContent.devpostDraft)}>
                                Copy All
                            </Button>
                            <Button variant="ghost" onClick={() => setShowSubmissionModal(false)}>
                                Close
                            </Button>
                        </div>
                    }
                >
                    <CodeBlock>
                        {result.generatedContent.devpostDraft}
                    </CodeBlock>
                </Modal>

                {/* Pitch Script Modal */}
                <Modal
                    isOpen={showPitchModal}
                    onClose={() => setShowPitchModal(false)}
                    title="Pitch Script"
                    size="lg"
                    footer={
                        <div className="flex gap-3">
                            <Button onClick={() => navigator.clipboard.writeText(result.generatedContent.pitchScript)}>
                                Copy All
                            </Button>
                            <Button variant="ghost" onClick={() => setShowPitchModal(false)}>
                                Close
                            </Button>
                        </div>
                    }
                >
                    <CodeBlock>
                        {result.generatedContent.pitchScript}
                    </CodeBlock>
                </Modal>

                {/* Footer */}
                <div className="mt-12 text-[var(--color-text-dim)] text-xs border-t border-[var(--color-border)] pt-6">
                    <p>
                        Report generated at: {new Date().toISOString()}
                    </p>
                    <p className="mt-1">
                        Powered by HackJudge AI • Kestra + Together AI
                    </p>
                </div>
            </div>
        </main>
    );
}
