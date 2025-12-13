/**
 * Report Page - Full evaluation report display
 * Fetches real evaluation results from API, falls back to mock for demo
 */
import { ReportClient } from './report-client';
import { getEvaluationResult, getAllEvaluations } from '@/lib/store';
import { getMockEvaluationResult } from '@/lib/mock-data';

export const metadata = {
    title: 'Project Report | HackJudge AI',
    description: 'Your hackathon project evaluation report with AI-powered insights.',
};

interface ReportPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
    const { projectId } = await params;

    // Debug: Log all stored evaluations
    const allEvals = getAllEvaluations();
    console.log('=== Report Page Debug ===');
    console.log('Looking for projectId:', projectId);
    console.log('Stored evaluations:', allEvals.map(e => ({ jobId: e.jobId, projectId: e.projectId, status: e.status, hasResult: !!e.result })));

    // Try to get real evaluation result from store using projectId as key
    const storedResult = getEvaluationResult(projectId);
    console.log('Found stored result:', !!storedResult);

    if (storedResult) {
        console.log('Using stored result with score:', storedResult.readinessScore);
        return <ReportClient result={storedResult} projectId={projectId} />;
    }

    // Fallback to mock data for demo/old URLs
    console.log('Falling back to mock data');
    const mockResult = getMockEvaluationResult(projectId);
    return <ReportClient result={mockResult} projectId={projectId} />;
}
