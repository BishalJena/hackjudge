/**
 * Evaluation Report API - Fetch completed evaluation report
 */
import { NextRequest, NextResponse } from 'next/server';
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

    // In production, fetch real report from database
    // For demo, return mock data
    const projectId = `demo-${jobId.split('_')[2] || 'project'}`;
    const result = getMockEvaluationResult(projectId);

    return NextResponse.json({
        success: true,
        data: result,
    });
}
