/**
 * Evaluation Status API - Poll evaluation progress
 */
import { NextRequest, NextResponse } from 'next/server';

interface StatusParams {
    params: Promise<{ jobId: string }>;
}

// Mock evaluation steps for demo
const EVALUATION_STEPS = [
    { id: 'clone', name: 'Clone Repository', duration: 2000 },
    { id: 'metadata', name: 'Extract Metadata', duration: 1500 },
    { id: 'build', name: 'Build Project', duration: 3000 },
    { id: 'lighthouse', name: 'Run Lighthouse', duration: 2500 },
    { id: 'screenshots', name: 'Capture Screenshots', duration: 2000 },
    { id: 'agents', name: 'Multi-Agent Analysis', duration: 4000 },
    { id: 'report', name: 'Generate Report', duration: 1500 },
];

export async function GET(request: NextRequest, { params }: StatusParams) {
    const { jobId } = await params;

    if (!jobId) {
        return NextResponse.json(
            { success: false, error: 'Job ID is required' },
            { status: 400 }
        );
    }

    // In production, fetch real status from database/Kestra
    // For demo, return mock progress based on time

    // Simulate progress based on job ID timestamp
    const jobTimestamp = parseInt(jobId.split('_')[1] || '0', 10);
    const elapsed = Date.now() - jobTimestamp;

    let currentStep = 0;
    let accumulatedTime = 0;

    for (let i = 0; i < EVALUATION_STEPS.length; i++) {
        accumulatedTime += EVALUATION_STEPS[i].duration;
        if (elapsed < accumulatedTime) {
            currentStep = i;
            break;
        }
        currentStep = i + 1;
    }

    const isComplete = currentStep >= EVALUATION_STEPS.length;
    const projectId = `demo-${jobId.split('_')[2] || 'project'}`;

    const steps = EVALUATION_STEPS.map((step, index) => ({
        id: step.id,
        name: step.name,
        status: index < currentStep
            ? 'complete'
            : index === currentStep && !isComplete
                ? 'running'
                : isComplete && index < EVALUATION_STEPS.length
                    ? 'complete'
                    : 'pending',
    }));

    return NextResponse.json({
        success: true,
        data: {
            jobId,
            projectId,
            status: isComplete ? 'complete' : 'running',
            currentStep: Math.min(currentStep, EVALUATION_STEPS.length - 1),
            totalSteps: EVALUATION_STEPS.length,
            steps,
            progress: Math.min((currentStep / EVALUATION_STEPS.length) * 100, 100),
            startedAt: new Date(jobTimestamp).toISOString(),
            estimatedCompletion: isComplete
                ? null
                : new Date(jobTimestamp + EVALUATION_STEPS.reduce((sum, s) => sum + s.duration, 0)).toISOString(),
            logs: steps
                .filter(s => s.status !== 'pending')
                .map(s => s.status === 'complete' ? `✓ ${s.name} completed` : `⋯ ${s.name}...`),
        },
    });
}
