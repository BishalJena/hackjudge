/**
 * Evaluation Report API - Fetch completed evaluation report
 */
import { NextRequest, NextResponse } from 'next/server';
import { getEvaluationResult } from '@/lib/store';
import { getMockEvaluationResult } from '@/lib/mock-data';

interface ReportParams {
    params: Promise<{ jobId: string }>;
}

export async function GET(request: NextRequest, { params }: ReportParams) {
    const { jobId } = await params;

    if (!jobId) {
        return NextResponse.json(
            { success: false, error: 'Job ID is required' },
            { status: 400 }
        );
    }

    // Try to get real evaluation result from store
    const storedResult = getEvaluationResult(jobId);

    if (storedResult) {
        return NextResponse.json({
            success: true,
            data: storedResult,
            source: 'evaluation',
        });
    }

    // Fallback to mock data if no stored result (for demo purposes)
    console.log(`No stored result for ${jobId}, returning mock data`);
    const projectId = `demo-${jobId.split('_')[2] || 'project'}`;
    const result = getMockEvaluationResult(projectId);

    return NextResponse.json({
        success: true,
        data: result,
        source: 'mock',
    });
}
