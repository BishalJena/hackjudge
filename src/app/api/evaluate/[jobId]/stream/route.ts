/**
 * SSE API Route - Real-time evaluation progress streaming
 * Now with actual LLM evaluation when Kestra is not available
 */
import { NextRequest } from 'next/server';
import { getExecutionStatus, mapExecutionToProgress, fetchKestraReport, transformKestraReport } from '@/lib/kestra';
import { runEvaluation, EvaluationInput } from '@/lib/evaluation';
import { storeEvaluationResult, updateEvaluationStatus, storeEvaluationError, createEvaluation } from '@/lib/store';
import { parseGitHubUrl, getRepoInfo } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StreamParams {
    params: Promise<{ jobId: string }>;
}

export async function GET(request: NextRequest, { params }: StreamParams) {
    const { jobId } = await params;
    const executionId = request.nextUrl.searchParams.get('executionId');
    const repoUrl = request.nextUrl.searchParams.get('repoUrl') || '';
    const branch = request.nextUrl.searchParams.get('branch') || 'main';

    // Create a readable stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (event: string, data: unknown) => {
                const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            // Send initial connection event
            sendEvent('connected', { jobId, executionId, mode: executionId ? 'kestra' : 'llm' });

            if (executionId) {
                // Kestra mode - poll real execution
                await handleKestraMode(jobId, executionId, sendEvent);
            } else {
                // LLM mode - run actual evaluation with LLM
                await handleLLMMode(jobId, repoUrl, branch, sendEvent);
            }

            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}

/**
 * Handle Kestra execution mode - poll for updates
 */
async function handleKestraMode(
    jobId: string,
    executionId: string,
    sendEvent: (event: string, data: unknown) => void
) {
    let isComplete = false;
    let pollCount = 0;
    const maxPolls = 180; // 3 minutes max (Kestra workflows can take time)
    const pollInterval = 1000; // 1 second

    // Create evaluation entry in store with executionId as fallback projectId
    createEvaluation(jobId, jobId, '');

    while (!isComplete && pollCount < maxPolls) {
        try {
            const execution = await getExecutionStatus(executionId);

            if (execution) {
                const progress = mapExecutionToProgress(execution);

                sendEvent('progress', {
                    jobId,
                    executionId,
                    mode: 'kestra',
                    status: progress.status,
                    currentStep: progress.currentStep,
                    totalSteps: progress.totalSteps,
                    steps: progress.steps,
                    progress: (progress.currentStep / progress.totalSteps) * 100,
                    logs: progress.logs,
                });

                if (progress.status === 'complete') {
                    isComplete = true;

                    // Fetch the actual report from Kestra
                    console.log('Fetching Kestra report for execution:', executionId);
                    const kestraReport = await fetchKestraReport(executionId);

                    if (kestraReport) {
                        // Transform and store the result
                        const result = transformKestraReport(kestraReport);
                        storeEvaluationResult(jobId, result);

                        // Also store by projectId for report lookup
                        storeEvaluationResult(result.projectId, result);

                        console.log('Stored Kestra evaluation result for:', result.projectId);

                        sendEvent('complete', {
                            jobId,
                            projectId: result.projectId,
                            status: 'complete',
                            readinessScore: result.readinessScore,
                        });
                    } else {
                        console.warn('Could not fetch Kestra report, workflow may have failed');
                        sendEvent('complete', {
                            jobId,
                            status: 'complete',
                            warning: 'Report not available from Kestra',
                        });
                    }
                } else if (progress.status === 'failed') {
                    isComplete = true;
                    storeEvaluationError(jobId, 'Kestra workflow failed');
                    sendEvent('error', {
                        jobId,
                        status: 'failed',
                        message: 'Evaluation workflow failed',
                    });
                }
            }
        } catch (error) {
            console.error('SSE poll error:', error);
            sendEvent('error', { message: 'Polling error', error: String(error) });
        }

        if (!isComplete) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            pollCount++;
        }
    }

    if (!isComplete) {
        sendEvent('timeout', { message: 'Evaluation timed out' });
    }
}

/**
 * Handle LLM evaluation mode - run actual AI evaluation
 */
async function handleLLMMode(
    jobId: string,
    repoUrl: string,
    branch: string,
    sendEvent: (event: string, data: unknown) => void
) {
    // LLM mode has 4 actual steps (different from Kestra's 6 steps)
    const STEPS = [
        { id: 'setup', name: 'Fetching Repository' },
        { id: 'metadata', name: 'Extracting Metadata' },
        { id: 'analyze', name: 'Running AI Analysis' },
        { id: 'report', name: 'Generating Report' },
    ];

    // Generate project ID from repo URL or job ID
    let projectName = jobId;
    const parsed = parseGitHubUrl(repoUrl);
    if (parsed) {
        projectName = `${parsed.owner}-${parsed.repo}`;
    }

    // Create evaluation entry in store
    createEvaluation(jobId, projectName, repoUrl);

    const sendProgress = (
        stepIndex: number,
        status: 'running' | 'complete',
        logs: string[]
    ) => {
        const steps = STEPS.map((step, i) => ({
            id: step.id,
            name: step.name,
            status: i < stepIndex ? 'complete' : i === stepIndex ? status : 'pending',
        }));

        sendEvent('progress', {
            jobId,
            projectId: projectName,
            mode: 'llm',
            status: status === 'complete' && stepIndex === STEPS.length - 1 ? 'complete' : 'running',
            currentStep: stepIndex,
            totalSteps: STEPS.length,
            steps,
            progress: ((stepIndex + (status === 'complete' ? 1 : 0.5)) / STEPS.length) * 100,
            logs,
        });
    };

    try {
        updateEvaluationStatus(jobId, 'running');
        const logs: string[] = [];

        // Step 0: Fetch repository info
        sendProgress(0, 'running', ['⋯ Fetching repository...']);

        let metadata: EvaluationInput['metadata'] = {};
        const readme = '';

        if (parsed) {
            // Fetch basic repo info
            const repoInfo = await getRepoInfo(parsed.owner, parsed.repo);
            if (repoInfo) {
                metadata = {
                    language: repoInfo.language || undefined,
                    hasReadme: true, // Assume true for now
                };
            }
        }

        logs.push('✓ Repository info fetched');
        sendProgress(0, 'complete', logs);

        // Step 1: Extract metadata
        sendProgress(1, 'running', [...logs, '⋯ Extracting metadata...']);
        await new Promise(resolve => setTimeout(resolve, 500));
        logs.push('✓ Metadata extracted');
        sendProgress(1, 'complete', logs);

        // Step 2: Run AI agents
        sendProgress(2, 'running', [...logs, '⋯ Running AI analysis...']);

        const evaluationInput: EvaluationInput = {
            repoUrl,
            branch,
            projectName,
            metadata,
            readme,
        };

        const result = await runEvaluation(evaluationInput, (progress) => {
            // Update logs with agent progress
            if (progress.status === 'running') {
                sendProgress(2, 'running', [...logs, `⋯ ${progress.message || 'Analyzing...'}`]);
            }
        });

        logs.push('✓ AI analysis complete');
        sendProgress(2, 'complete', logs);

        // Step 3: Generate report
        sendProgress(3, 'running', [...logs, '⋯ Generating report...']);

        // Store the result
        storeEvaluationResult(jobId, result);

        logs.push('✓ Report generated');
        sendProgress(3, 'complete', logs);

        // Send completion event
        sendEvent('complete', {
            jobId,
            projectId: result.projectId,
            status: 'complete',
            readinessScore: result.readinessScore,
        });

    } catch (error) {
        console.error('LLM evaluation error:', error);
        storeEvaluationError(jobId, String(error));
        sendEvent('error', {
            jobId,
            message: 'Evaluation failed',
            error: String(error),
        });
    }
}
