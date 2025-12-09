/**
 * SSE API Route - Real-time evaluation progress streaming
 */
import { NextRequest } from 'next/server';
import { getExecutionStatus, mapExecutionToProgress } from '@/lib/kestra';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StreamParams {
    params: Promise<{ jobId: string }>;
}

export async function GET(request: NextRequest, { params }: StreamParams) {
    const { jobId } = await params;
    const executionId = request.nextUrl.searchParams.get('executionId');

    // Create a readable stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (event: string, data: unknown) => {
                const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            // Send initial connection event
            sendEvent('connected', { jobId, executionId });

            // Poll for updates
            let isComplete = false;
            let pollCount = 0;
            const maxPolls = 120; // 2 minutes max
            const pollInterval = 1000; // 1 second

            while (!isComplete && pollCount < maxPolls) {
                try {
                    if (executionId) {
                        // Kestra mode - poll real execution
                        const execution = await getExecutionStatus(executionId);

                        if (execution) {
                            const progress = mapExecutionToProgress(execution);

                            sendEvent('progress', {
                                jobId,
                                executionId,
                                status: progress.status,
                                currentStep: progress.currentStep,
                                totalSteps: progress.totalSteps,
                                steps: progress.steps,
                                progress: (progress.currentStep / progress.totalSteps) * 100,
                                logs: progress.logs,
                            });

                            if (progress.status === 'complete' || progress.status === 'failed') {
                                isComplete = true;
                                sendEvent(progress.status === 'complete' ? 'complete' : 'error', {
                                    jobId,
                                    status: progress.status,
                                });
                            }
                        }
                    } else {
                        // Mock mode - simulate progress
                        const mockProgress = getMockProgress(jobId, pollCount);

                        sendEvent('progress', mockProgress);

                        if (mockProgress.status === 'complete') {
                            isComplete = true;
                            sendEvent('complete', { jobId, status: 'complete' });
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

// Mock progress generator
function getMockProgress(jobId: string, pollCount: number) {
    const STEPS = [
        { id: 'clone', name: 'Clone Repository', duration: 2 },
        { id: 'metadata', name: 'Extract Metadata', duration: 2 },
        { id: 'build', name: 'Build Project', duration: 4 },
        { id: 'lighthouse', name: 'Run Lighthouse', duration: 3 },
        { id: 'screenshots', name: 'Capture Screenshots', duration: 2 },
        { id: 'agents', name: 'Multi-Agent Analysis', duration: 6 },
        { id: 'report', name: 'Generate Report', duration: 2 },
    ];

    const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0);
    const elapsed = pollCount;

    let currentStep = 0;
    let accumulatedDuration = 0;

    for (let i = 0; i < STEPS.length; i++) {
        accumulatedDuration += STEPS[i].duration;
        if (elapsed < accumulatedDuration) {
            currentStep = i;
            break;
        }
        currentStep = i + 1;
    }

    const isComplete = currentStep >= STEPS.length;
    const projectId = `demo-${jobId.split('_')[2] || 'project'}`;

    const steps = STEPS.map((step, index) => ({
        id: step.id,
        name: step.name,
        status: index < currentStep
            ? 'complete'
            : index === currentStep && !isComplete
                ? 'running'
                : isComplete
                    ? 'complete'
                    : 'pending',
    }));

    const logs: string[] = [];
    for (const step of steps) {
        if (step.status === 'complete') {
            logs.push(`✓ ${step.name} completed`);
        } else if (step.status === 'running') {
            logs.push(`⋯ ${step.name}...`);
        }
    }

    return {
        jobId,
        projectId,
        mode: 'mock',
        status: isComplete ? 'complete' : 'running',
        currentStep: Math.min(currentStep, STEPS.length - 1),
        totalSteps: STEPS.length,
        steps,
        progress: Math.min((currentStep / STEPS.length) * 100, 100),
        logs,
        elapsedSeconds: elapsed,
    };
}
