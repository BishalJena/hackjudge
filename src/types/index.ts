/**
 * HackJudge AI - TypeScript Type Definitions
 * Core data structures for the hackathon review platform
 */

// ═══════════════════════════════════════════════════════════════════════════
// Project Types
// ═══════════════════════════════════════════════════════════════════════════

export type ProjectStatus = 'pending' | 'evaluating' | 'complete' | 'failed';

export interface Project {
    id: string;
    repoUrl: string;
    branch: string;
    hackathonUrl?: string;
    createdAt: Date;
    status: ProjectStatus;
    userId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Evaluation Types
// ═══════════════════════════════════════════════════════════════════════════

export interface DimensionScores {
    innovation: number;      // 0-100
    technical: number;       // 0-100
    ux: number;              // 0-100
    performance: number;     // 0-100
    codeQuality: number;     // 0-100
    presentation: number;    // 0-100
}

export interface AwardEligibility {
    name: string;
    eligible: boolean;
    confidence: number;      // 0-100
    reason?: string;
}

export interface GeneratedContent {
    devpostDraft: string;
    pitchScript: string;
    architectureDiagram: string;
}

export interface EvaluationResult {
    projectId: string;
    readinessScore: number;  // 0-100
    status: 'STRONG' | 'GOOD' | 'NEEDS_WORK' | 'WEAK';
    summary: string;
    dimensions: DimensionScores;
    strengths: string[];
    weaknesses: string[];
    agentFeedback: AgentOutput[];
    improvements: Improvement[];
    awardEligibility: AwardEligibility[];
    generatedContent: GeneratedContent;
    screenshots?: string[];
    lighthouseScores?: LighthouseScores;
    // Phase 2: Security and CI/CD
    security?: {
        score: number;
        vulnerabilities: { critical: number; high: number; moderate: number; low: number };
        summary: string;
    };
    cicdStatus?: {
        hasCI: boolean;
        provider: string | null;
        hasDocker: boolean;
        hasDeployConfig: boolean;
        details: string[];
    };
    repoUrl?: string;
    completedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent Types
// ═══════════════════════════════════════════════════════════════════════════

export type AgentType =
    | 'code_quality'
    | 'product'
    | 'ux'
    | 'performance'
    | 'sponsor'
    | 'presentation';

export interface Evidence {
    type: 'code' | 'screenshot' | 'metric' | 'documentation';
    location?: string;        // file path or URL
    snippet?: string;         // code snippet if applicable
    description: string;
}

export interface AgentOutput {
    agentName: string;
    agentType: AgentType;
    score: number;           // 0-100
    confidence: number;      // 0-100
    strengths: string[];
    weaknesses: string[];
    judgeComment: string;
    evidence: Evidence[];
    suggestions: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Improvement Types
// ═══════════════════════════════════════════════════════════════════════════

export type ImprovementCategory = 'quick-win' | 'medium' | 'complex';

export interface Improvement {
    rank: number;
    category: ImprovementCategory;
    title: string;
    issue: string;
    rootCause: string;
    impact: number;          // points added to score
    effort: number;          // estimated hours
    actionItems: string[];
    codeChanges?: CodeChange[];
}

export interface CodeChange {
    file: string;
    description: string;
    before?: string;
    after?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Performance Types
// ═══════════════════════════════════════════════════════════════════════════

export interface LighthouseScores {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa?: number;
    metrics: {
        lcp: number;           // Largest Contentful Paint (ms)
        fid: number;           // First Input Delay (ms)
        cls: number;           // Cumulative Layout Shift
        fcp: number;           // First Contentful Paint (ms)
        ttfb: number;          // Time to First Byte (ms)
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// Evaluation Progress Types
// ═══════════════════════════════════════════════════════════════════════════

export type EvaluationStepStatus = 'pending' | 'running' | 'complete' | 'failed';

export interface EvaluationStep {
    id: string;
    name: string;
    status: EvaluationStepStatus;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
    logs?: string[];
}

export interface EvaluationProgress {
    jobId: string;
    projectId: string;
    currentStep: number;
    totalSteps: number;
    steps: EvaluationStep[];
    startedAt: Date;
    estimatedCompletion?: Date;
    logs: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// API Types
// ═══════════════════════════════════════════════════════════════════════════

export interface EvaluateRequest {
    repoUrl: string;
    branch?: string;
    hackathonUrl?: string;
    settings?: EvaluationSettings;
}

export interface EvaluationSettings {
    buildType: 'full' | 'quick';
    timeout: number;         // minutes
    skipLighthouse?: boolean;
    skipScreenshots?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// User Types
// ═══════════════════════════════════════════════════════════════════════════

export interface User {
    id: string;
    githubId: string;
    username: string;
    avatarUrl?: string;
    email?: string;
    createdAt: Date;
}

export interface GitHubRepo {
    id: number;
    name: string;
    fullName: string;
    private: boolean;
    htmlUrl: string;
    description?: string;
    defaultBranch: string;
    language?: string;
    updatedAt: Date;
}
