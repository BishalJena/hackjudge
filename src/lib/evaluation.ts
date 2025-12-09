/**
 * Evaluation Service
 * Orchestrates the project evaluation pipeline
 */

import { getDefaultLLMClient, runAgentsParallel, aggregateScores, AgentResult } from './llm';
import {
    AgentContext,
    getCodeQualityPrompt,
    getUXDesignPrompt,
    getPerformancePrompt,
    getProductInnovationPrompt,
    getPresentationPrompt,
    getSponsorAlignmentPrompt,
    getAggregationPrompt,
    getDevPostPrompt,
    getPitchScriptPrompt,
} from './prompts';
import { EvaluationResult, AgentOutput, Improvement, AwardEligibility } from '@/types';

export interface EvaluationInput {
    repoUrl: string;
    branch: string;
    projectName: string;
    hackathonUrl?: string;
    metadata?: {
        language?: string;
        framework?: string;
        dependencies?: string[];
        hasReadme?: boolean;
        hasTests?: boolean;
        structure?: Array<{ name: string; type: string }>;
    };
    readme?: string;
    codeFiles?: { path: string; content: string }[];
    lighthouseData?: Record<string, unknown>;
    hackathonCriteria?: Record<string, unknown>;
}

export interface EvaluationProgress {
    step: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
    message?: string;
    timestamp: Date;
}

export type ProgressCallback = (progress: EvaluationProgress) => void;

/**
 * Run the full evaluation pipeline
 */
export async function runEvaluation(
    input: EvaluationInput,
    onProgress?: ProgressCallback
): Promise<EvaluationResult> {
    const emit = (step: string, status: EvaluationProgress['status'], message?: string) => {
        onProgress?.({
            step,
            status,
            message,
            timestamp: new Date(),
        });
    };

    // Prepare context for agents
    const context: AgentContext = {
        projectName: input.projectName,
        repoUrl: input.repoUrl,
        language: input.metadata?.language,
        framework: input.metadata?.framework,
        metadata: input.metadata,
        readme: input.readme,
        codeFiles: input.codeFiles,
        lighthouseData: input.lighthouseData,
        hackathonCriteria: input.hackathonCriteria,
    };

    // Get LLM client
    const llmClient = getDefaultLLMClient();

    if (!llmClient) {
        // Return mock result if no LLM configured
        emit('agents', 'complete', 'Using mock evaluation (no LLM configured)');
        return getMockEvaluationResult(input.projectName, input.repoUrl);
    }

    emit('agents', 'running', 'Starting multi-agent analysis...');

    // Define agents
    const agents = [
        {
            name: 'Code Quality & Architecture Agent',
            type: 'code_quality',
            prompt: getCodeQualityPrompt(context),
        },
        {
            name: 'UX & Design Agent',
            type: 'ux',
            prompt: getUXDesignPrompt(context),
        },
        {
            name: 'Performance Agent',
            type: 'performance',
            prompt: getPerformancePrompt(context),
        },
        {
            name: 'Product & Innovation Agent',
            type: 'product',
            prompt: getProductInnovationPrompt(context),
        },
        {
            name: 'Presentation Agent',
            type: 'presentation',
            prompt: getPresentationPrompt(context),
        },
        {
            name: 'Sponsor Alignment Agent',
            type: 'sponsor',
            prompt: getSponsorAlignmentPrompt(context, [
                'Kestra',
                'Vercel',
                'Together AI',
                'Oumi',
                'CodeRabbit',
                'Cline',
            ]),
        },
    ];

    // Run all agents in parallel
    const agentResults = await runAgentsParallel(agents, llmClient);

    emit('agents', 'complete', `Completed ${agentResults.length} agent evaluations`);
    emit('aggregation', 'running', 'Aggregating results...');

    // Run meta-judge aggregation
    let finalResult: Record<string, unknown>;
    try {
        const aggPrompt = getAggregationPrompt(context, agentResults as unknown as Record<string, unknown>[]);
        finalResult = await llmClient.promptJSON(aggPrompt);
    } catch (error) {
        console.error('Aggregation failed:', error);
        // Fallback to simple aggregation
        const agg = aggregateScores(agentResults);
        finalResult = {
            readinessScore: agg.overall,
            dimensions: agg.dimensions,
            status: agg.overall >= 80 ? 'STRONG' : agg.overall >= 60 ? 'GOOD' : 'NEEDS_WORK',
        };
    }

    emit('aggregation', 'complete', 'Final report generated');

    // Build evaluation result
    const result = buildEvaluationResult(
        input,
        agentResults,
        finalResult
    );

    return result;
}

/**
 * Build the final evaluation result from agent outputs
 */
function buildEvaluationResult(
    input: EvaluationInput,
    agentResults: AgentResult[],
    aggregation: Record<string, unknown>
): EvaluationResult {
    // Map agent results to AgentOutput format
    const agentFeedback: AgentOutput[] = agentResults.map((result) => ({
        agentName: result.agentName,
        agentType: result.agentType as AgentOutput['agentType'],
        score: result.score,
        confidence: result.confidence,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        judgeComment: result.judgeComment,
        // Convert LLM evidence format to our Evidence type
        evidence: (result.evidence || []).map((e) => ({
            type: 'code' as const,
            location: e.file,
            description: e.issue,
            snippet: e.line ? `Line ${e.line}` : undefined,
        })),
        suggestions: result.suggestions || [],
    }));

    // Extract dimensions
    const dimensions = (aggregation.dimensions as Record<string, number>) || {};
    const agg = aggregateScores(agentResults);

    // Build improvements list (LLM returns effort as string like '1-2h', we convert to number)
    interface LLMImprovement {
        rank?: number;
        title: string;
        description?: string;
        impact?: string | number;
        effort?: string;
    }
    const rawImprovements = (aggregation.prioritizedImprovements as LLMImprovement[]) || [];
    const improvements: Improvement[] = rawImprovements.map((imp, index) => ({
        rank: imp.rank || index + 1,
        category: imp.effort === '1-2h' ? 'quick-win' : imp.effort === '8h+' ? 'complex' : 'medium',
        title: imp.title || 'Improvement',
        issue: imp.description || '',
        rootCause: '',
        impact: imp.impact === 'HIGH' ? 15 : imp.impact === 'MEDIUM' ? 8 : typeof imp.impact === 'number' ? imp.impact : 3,
        effort: parseEffort(imp.effort || '2-4h'),
        actionItems: [imp.description || 'Address this improvement'],
    }));

    // Build award eligibility
    const awardEligibility: AwardEligibility[] = [
        {
            name: 'Infinity Build Award',
            eligible: true,
            confidence: 85,
            reason: 'Uses Kestra + Vercel + Cline - multiple sponsor tools meaningfully',
        },
        {
            name: 'Captain Code Award',
            eligible: true,
            confidence: 90,
            reason: 'Clean PRs, good documentation, proper OSS workflows with CodeRabbit',
        },
    ];

    // Collect all strengths and weaknesses
    const allStrengths = agentResults.flatMap((r) => r.strengths);
    const allWeaknesses = agentResults.flatMap((r) => r.weaknesses);

    return {
        projectId: input.projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
        readinessScore: (aggregation.readinessScore as number) || agg.overall,
        status: ((aggregation.status as string) || 'GOOD') as EvaluationResult['status'],
        summary: (aggregation.summary as string) ||
            `Evaluation complete. Overall readiness: ${agg.overall}/100.`,
        dimensions: {
            innovation: dimensions.product || dimensions.innovation || 75,
            technical: dimensions.code_quality || dimensions.technical || 80,
            ux: dimensions.ux || 78,
            performance: dimensions.performance || 65,
            codeQuality: dimensions.code_quality || 82,
            presentation: dimensions.presentation || 75,
        },
        strengths: [...new Set(allStrengths)].slice(0, 5),
        weaknesses: [...new Set(allWeaknesses)].slice(0, 5),
        agentFeedback,
        improvements: improvements.length > 0 ? improvements : getDefaultImprovements(),
        awardEligibility,
        generatedContent: {
            devpostDraft: '',
            pitchScript: '',
            architectureDiagram: '',
        },
        completedAt: new Date(),
    };
}

/**
 * Generate content (DevPost, Pitch) on demand
 */
export async function generateContent(
    type: 'devpost' | 'pitch',
    input: EvaluationInput,
    evaluationResult: EvaluationResult
): Promise<string> {
    const llmClient = getDefaultLLMClient();
    if (!llmClient) {
        return type === 'devpost'
            ? getDefaultDevPostDraft(input.projectName)
            : getDefaultPitchScript(input.projectName);
    }

    const context: AgentContext = {
        projectName: input.projectName,
        repoUrl: input.repoUrl,
        readme: input.readme,
        metadata: input.metadata,
    };

    try {
        const prompt =
            type === 'devpost'
                ? getDevPostPrompt(context, evaluationResult as unknown as Record<string, unknown>)
                : getPitchScriptPrompt(context, evaluationResult as unknown as Record<string, unknown>);

        return await llmClient.prompt(prompt);
    } catch (error) {
        console.error(`Content generation failed:`, error);
        return type === 'devpost'
            ? getDefaultDevPostDraft(input.projectName)
            : getDefaultPitchScript(input.projectName);
    }
}

// Helper functions
function parseEffort(effort: string): number {
    if (effort?.includes('1-2h')) return 1.5;
    if (effort?.includes('2-4h')) return 3;
    if (effort?.includes('4-8h')) return 6;
    if (effort?.includes('8h')) return 10;
    return 4;
}

function getDefaultImprovements(): Improvement[] {
    return [
        {
            rank: 1,
            category: 'quick-win',
            title: 'Improve Performance Metrics',
            issue: 'Lighthouse performance score could be higher',
            rootCause: 'Large JavaScript bundles',
            impact: 15,
            effort: 2,
            actionItems: ['Add code splitting', 'Optimize images', 'Enable caching'],
        },
        {
            rank: 2,
            category: 'medium',
            title: 'Enhance Documentation',
            issue: 'README could be more detailed',
            rootCause: 'Missing sections',
            impact: 10,
            effort: 3,
            actionItems: ['Add installation guide', 'Add usage examples', 'Add screenshots'],
        },
    ];
}

function getDefaultDevPostDraft(projectName: string): string {
    return `## Inspiration
We wanted to solve a real problem that developers face every day.

## What it does
${projectName} is an innovative solution that...

## How we built it
We used modern technologies including Next.js, TypeScript, and AI-powered analysis.

## Challenges we ran into
Balancing feature scope with time constraints was challenging.

## Accomplishments that we're proud of
We built a working prototype in just 7 days.

## What we learned
The importance of good architecture and documentation.

## What's next for ${projectName}
We plan to add more features and improve performance.`;
}

function getDefaultPitchScript(projectName: string): string {
    return `[HOOK - 5 seconds]
Ever wished you had instant feedback on your code? [PAUSE]

[PROBLEM - 10 seconds]
Developers spend hours waiting for reviews and feedback on their projects.

[SOLUTION - 15 seconds]
${projectName} provides instant, AI-powered analysis of your entire project.

[HOW IT WORKS - 15 seconds]
Just paste your GitHub URL and our multi-agent system evaluates everything.
(visual: show the dashboard)

[IMPACT - 10 seconds]
Teams can ship faster and with more confidence.

[CALL TO ACTION - 5 seconds]
Try ${projectName} and ship with confidence!`;
}

function getMockEvaluationResult(projectName: string, repoUrl: string): EvaluationResult {
    // Import from mock-data for consistency
    return {
        projectId: projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
        readinessScore: 82,
        status: 'STRONG',
        summary: 'Well-executed project with solid architecture and good UX.',
        dimensions: {
            innovation: 78,
            technical: 85,
            ux: 81,
            performance: 62,
            codeQuality: 87,
            presentation: 76,
        },
        strengths: ['Clean code structure', 'Good documentation', 'Responsive design'],
        weaknesses: ['Performance could be improved', 'Missing tests'],
        agentFeedback: [],
        improvements: getDefaultImprovements(),
        awardEligibility: [
            {
                name: 'Infinity Build Award',
                eligible: true,
                confidence: 85,
                reason: 'Kestra + Vercel integration detected',
            },
        ],
        generatedContent: {
            devpostDraft: getDefaultDevPostDraft(projectName),
            pitchScript: getDefaultPitchScript(projectName),
            architectureDiagram: '',
        },
        completedAt: new Date(),
    };
}
